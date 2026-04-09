# CLAUDE.md Template: Serverless Architecture

**Architecture Pattern**: Cloud-Native FaaS Applications
**Platform**: {{PLATFORM}} (AWS Lambda/Azure Functions/Google Cloud Functions)
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**Serverless development requires cloud expertise:**

1. **Cloud Architect**: Infrastructure and design
2. **Function Developer**: Lambda/Function implementation
3. **DevOps Engineer**: Deployment and monitoring
4. **QA Engineer**: Integration and performance testing

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn serverless-focused agents
npx @claude-flow/cli@latest agent spawn -t coder --name cloud-architect --capabilities "serverless,infrastructure,aws"
npx @claude-flow/cli@latest agent spawn -t coder --name lambda-developer --capabilities "lambda,nodejs,python"
npx @claude-flow/cli@latest agent spawn -t coder --name devops-cloud --capabilities "cloudformation,terraform,deployment"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Cloud Provider**: {{CLOUD_PROVIDER}}
- **Function Runtime**: {{RUNTIME}} (Node.js/Python/Go)
- **API Gateway**: {{API_GATEWAY}}
- **Database**: {{DATABASE}}

## 🔧 Development Patterns & Standards

### Serverless Project Structure
```
serverless-app/
├── src/
│   ├── functions/
│   │   ├── users/
│   │   │   ├── create.ts
│   │   │   ├── list.ts
│   │   │   ├── get.ts
│   │   │   ├── update.ts
│   │   │   └── delete.ts
│   │   ├── orders/
│   │   │   ├── create.ts
│   │   │   ├── process.ts
│   │   │   └── webhook.ts
│   │   ├── notifications/
│   │   │   ├── send-email.ts
│   │   │   └── send-sms.ts
│   │   └── shared/
│   │       ├── middleware.ts
│   │       ├── auth.ts
│   │       └── validators.ts
│   ├── layers/              # Lambda layers (shared code)
│   │   ├── database/
│   │   ├── auth/
│   │   └── utils/
│   ├── types/
│   ├── utils/
│   └── config.ts
├── infrastructure/
│   ├── serverless.yml       # Serverless Framework
│   ├── template.yaml        # CloudFormation/SAM
│   ├── terraform/           # Terraform IaC
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── env.yaml
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
├── package.json
└── README.md
```

## 🐝 Swarm Orchestration

### Phase 1: Cloud Architecture Design
- **Duration**: 2-3 days
- **Agents**: Cloud Architect
- **Output**: Infrastructure design, deployment strategy

### Phase 2: Function Development
- **Duration**: 5-10 days
- **Agents**: Lambda Developer
- **Focus**: Function implementation, local testing

### Phase 3: Infrastructure Setup
- **Duration**: 3-5 days
- **Agents**: DevOps Engineer, Cloud Architect
- **Focus**: IaC, deployment configuration, security

### Phase 4: Integration & Testing
- **Duration**: 5-10 days
- **Agents**: QA Engineer, Lambda Developer
- **Focus**: API integration, end-to-end testing

### Phase 5: Deployment & Monitoring
- **Duration**: 3-5 days
- **Agents**: DevOps Engineer
- **Focus**: Production deployment, monitoring setup

## 🧠 Memory Management

### Store Infrastructure Design
```bash
npx @claude-flow/cli@latest memory store --key "serverless-design-{{PROJECT_NAME}}" \
  --value "Function architecture, API design, event patterns" \
  --namespace architecture --tags "serverless,{{PROJECT_NAME}}"
```

### Store Deployment Strategy
```bash
npx @claude-flow/cli@latest memory store --key "deployment-strategy-{{PROJECT_NAME}}" \
  --value "IaC approach, environment configuration, deployment pipeline" \
  --namespace deployment --tags "serverless,deployment"
```

## 🚀 Infrastructure as Code

### Serverless Framework Configuration
```yaml
# serverless.yml
service: {{PROJECT_NAME}}

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: {{AWS_REGION}}
  environment:
    DB_HOST: ${ssm:/{{PROJECT_NAME}}/db/host}
    DB_PASSWORD: ${ssm:/{{PROJECT_NAME}}/db/password~true}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:Query
            - dynamodb:Scan
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:UpdateItem
          Resource: arn:aws:dynamodb:{{AWS_REGION}}:*:table/{{TABLE_NAME}}

functions:
  createUser:
    handler: src/functions/users/create.handler
    events:
      - httpApi:
          path: /users
          method: post
    timeout: 30

  getUser:
    handler: src/functions/users/get.handler
    events:
      - httpApi:
          path: /users/{id}
          method: get

  processOrder:
    handler: src/functions/orders/process.handler
    events:
      - sqs:
          arn: arn:aws:sqs:{{AWS_REGION}}:*:{{QUEUE_NAME}}
          batchSize: 10

  sendEmail:
    handler: src/functions/notifications/send-email.handler
    timeout: 60
    events:
      - sns:
          arn: !Ref EmailTopic
          topicName: {{PROJECT_NAME}}-email

layers:
  database:
    path: src/layers/database
    name: {{PROJECT_NAME}}-db-layer
    compatibleRuntimes:
      - nodejs18.x
    retain: false

plugins:
  - serverless-python-requirements
  - serverless-offline
  - serverless-dynamodb-local
```

### Terraform Configuration
```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

resource "aws_lambda_function" "create_user" {
  filename      = "build/functions/users/create.zip"
  function_name = "{{PROJECT_NAME}}-create-user"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30

  environment {
    variables = {
      DB_HOST = aws_rds_cluster.database.endpoint
    }
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }
}

resource "aws_apigatewayv2_api" "api" {
  name          = "{{PROJECT_NAME}}-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "create_user" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_method = "POST"
  payload_format_version = "2.0"
  target = aws_lambda_function.create_user.arn
}
```

## 📊 Monitoring & Logging

### CloudWatch Metrics
```javascript
// Log structured events
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  message: 'User created',
  userId: user.id,
  requestId: context.requestId,
}));
```

### X-Ray Tracing
```javascript
const AWSXRay = require('aws-xray-sdk-core');
const dynamodb = AWSXRay.client(new AWS.DynamoDB.DocumentClient());

exports.handler = async (event, context) => {
  const segment = AWSXRay.getSegment();
  const subsegment = segment.addNewSubsegment('database');

  try {
    const result = await dynamodb.get({...}).promise();
    subsegment.close();
    return result;
  } catch (error) {
    subsegment.addError(error);
    throw error;
  }
};
```

### Alarms and Notifications
```hcl
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "{{PROJECT_NAME}}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

## 🔒 Security & Compliance

### Environment Variables & Secrets
```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret --name {{PROJECT_NAME}}/db/password --secret-string "..."

# Reference in function
DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id {{PROJECT_NAME}}/db/password --query SecretString)
```

### API Security
- API Gateway throttling and rate limiting
- API key management
- Request/response validation
- CORS configuration

### IAM Permissions
- Least privilege principle
- Resource-based policies
- Function execution roles

## ✅ Testing Strategy

### Local Testing
```bash
# Run serverless offline
serverless offline start

# Run function locally
serverless invoke local --function createUser --data '{...}'
```

### Integration Tests
```
tests/integration/
├── user-api.test.ts
├── order-api.test.ts
└── notifications.test.ts
```

### Performance Testing
```bash
# Test cold starts
serverless invoke --function createUser --repeat 100

# Monitor duration and memory usage
```

## 🎯 Performance Targets

- Cold start latency: <1000ms
- Warm execution: <100ms
- Memory allocation: 128-1024MB
- Concurrent executions: Auto-scale
- Cost optimization: <$50/month per function

## 📋 Development Checklist

- [ ] Cloud provider account configured
- [ ] IaC templates created
- [ ] Functions scaffolded
- [ ] Local development environment set up
- [ ] Database/storage configured
- [ ] API Gateway configured
- [ ] Authentication/authorization implemented
- [ ] Event sources configured
- [ ] Logging and monitoring configured
- [ ] Cost optimization reviewed
- [ ] Security audit completed
- [ ] Deployment pipeline configured
- [ ] Production environment set up
- [ ] Documentation completed

---

**Generated from**: claude-flow CLAUDE.md Serverless Architecture Template
