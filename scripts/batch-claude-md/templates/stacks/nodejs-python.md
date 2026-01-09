## Node.js + Python Hybrid Guidelines

### Project Organization
```
project/
├── node/           # Node.js components
│   ├── src/
│   └── package.json
├── python/         # Python components
│   ├── app/
│   └── requirements.txt
└── docker-compose.yml
```

### Inter-Process Communication
- REST APIs for service communication
- Message queues (Redis, RabbitMQ)
- gRPC for high-performance needs
- Shared data stores

### Node.js Component
```typescript
// API client for Python service
import axios from 'axios';

export async function callPythonService(data: any) {
  const response = await axios.post('http://python-service:8000/api', data);
  return response.data;
}
```

### Python Component
```python
# FastAPI endpoint
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Request(BaseModel):
    data: dict

@app.post("/api")
async def process(request: Request):
    result = heavy_computation(request.data)
    return {"result": result}
```

### Containerization
```yaml
services:
  node-service:
    build: ./node
    ports:
      - "3000:3000"

  python-service:
    build: ./python
    ports:
      - "8000:8000"
```

### Data Sharing
- Shared volumes for file exchange
- Database for persistent data
- Redis for caching/sessions
- S3/MinIO for large files

### Best Practices
- Clear service boundaries
- Consistent API contracts
- Proper error handling across services
- Health checks for both services
- Coordinated logging
- Unified monitoring

### Development Workflow
- Separate development environments
- Shared configuration management
- Coordinated deployments
- Cross-service testing

### Performance
- Async operations in both services
- Connection pooling
- Caching strategies
- Load balancing
