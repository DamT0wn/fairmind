export const config = {
  runtime: 'edge',
};

const normalizeBackendBase = () => {
  const raw = (process.env.BACKEND_API_URL || process.env.VITE_API_URL || '').trim();
  if (!raw) {
    return '';
  }

  const trimmed = raw.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const mockAuditResponse = () => ({
  audit_id: `audit_${Date.now()}`,
  model_name: 'Demo Model',
  protected_attribute: 'gender',
  bias_metrics: {
    overall_accuracy: 0.82,
    overall_approval_rate: 0.65,
    demographic_parity_difference: 0.12,
    disparate_impact_ratio: 0.75,
    equalized_odds_difference: 0.15,
    equal_opportunity_difference: 0.14,
    predictive_parity_difference: 0.08,
    max_accuracy_diff: 0.18,
    fairness_grade: 'C',
    bias_level: 'Moderate',
    eeoc_80_rule_pass: false,
    eeoc_80_rule_value: 0.75,
    eu_ai_act_compliant: false,
    most_disadvantaged_group: 'Female',
    most_disadvantaged_rate: 0.58,
  },
  group_metrics: {
    Male: {
      count: 520,
      approval_rate: 0.70,
      accuracy: 0.84,
      precision: 0.80,
      true_positive_rate: 0.82,
      false_positive_rate: 0.12,
      false_negative_rate: 0.18,
      true_negative_rate: 0.88,
      recall: 0.82,
    },
    Female: {
      count: 480,
      approval_rate: 0.58,
      accuracy: 0.80,
      precision: 0.75,
      true_positive_rate: 0.68,
      false_positive_rate: 0.22,
      false_negative_rate: 0.32,
      true_negative_rate: 0.78,
      recall: 0.68,
    },
  },
  mitigation_strategies: [
    {
      name: 'Resampling & Balancing',
      phase: 'Pre-processing',
      description: 'Adjust training data distribution to balance outcomes across demographic groups.',
      steps: ['Identify underrepresented groups', 'Apply SMOTE or oversampling', 'Retrain model'],
      difficulty: 'Easy',
      estimated_impact: 'High',
      regulatory_relevance: 'EU AI Act Art. 10',
    },
    {
      name: 'Threshold Optimization',
      phase: 'Post-processing',
      description: 'Apply group-specific decision thresholds to achieve equalized odds.',
      steps: ['Analyze probability scores by group', 'Determine optimal thresholds'],
      difficulty: 'Medium',
      estimated_impact: 'High',
      regulatory_relevance: 'EEOC 4/5ths Rule',
    },
  ],
  timestamp: new Date().toISOString(),
});

const mockHealthResponse = () => ({
  status: 'healthy',
  service: 'FairScan AI Bias Auditor',
  mode: 'mock',
});

const mockDemoDataResponse = () => ({
  modelName: 'Demo Credit Approval Model',
  protectedAttribute: 'gender',
  useCase: 'credit',
  predictions: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0],
  actuals: [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0],
  groups: [
    'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female',
    'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female',
  ],
});

export default async function handler(request) {
  const backendBase = normalizeBackendBase();
  const incomingUrl = new URL(request.url);
  const apiPath = incomingUrl.pathname.replace(/^\/api\/?/, '');
  const method = request.method.toUpperCase();

  // If no backend URL configured, serve mock data
  if (!backendBase) {
    if (apiPath === 'health' || apiPath === '') {
      return new Response(JSON.stringify(mockHealthResponse()), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (apiPath === 'demo-data') {
      return new Response(JSON.stringify(mockDemoDataResponse()), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (apiPath === 'audit' && method === 'POST') {
      return new Response(JSON.stringify(mockAuditResponse()), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (apiPath.startsWith('audit/csv') && method === 'POST') {
      return new Response(JSON.stringify(mockAuditResponse()), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (apiPath === 'generate-report' && method === 'POST') {
      // Return a simple PDF placeholder
      const pdfBuffer = Buffer.from(
        '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj 4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 100 700 Td (FairScan Mock Report) Tj ET\nendstream endobj 5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj xref 0 6 0000000000 65535 f 0000000009 00000 n 0000000058 00000 n 0000000115 00000 n 0000000229 00000 n 0000000373 00000 n trailer<</Size 6/Root 1 0 R>>startxref 457 %%EOF'
      );
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="fairmind-report.pdf"',
        },
      });
    }
    return new Response(
      JSON.stringify({ detail: `Mock: endpoint /${apiPath} not found` }),
      { status: 404, headers: { 'content-type': 'application/json' } }
    );
  }

  // If backend URL is configured, proxy to it
  const upstreamUrl = `${backendBase}/${apiPath}${incomingUrl.search}`;
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  const init = {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : request.body,
    redirect: 'follow',
  };

  try {
    const upstream = await fetch(upstreamUrl, init);
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        detail: `Upstream request failed: ${err?.message || 'unknown error'}`,
      }),
      {
        status: 502,
        headers: { 'content-type': 'application/json' },
      }
    );
  }
}
