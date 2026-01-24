# CLAUDE.md Template: Rust Development

**Language**: Rust {{RUST_VERSION}} (1.70+)
**Package Manager**: Cargo
**Execution Model**: Zero-Cost Abstractions
**Memory Safety**: Guaranteed at Compile Time

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Rust Version**: {{RUST_VERSION}}
- **Target Domain**: {{TARGET_DOMAIN}} (Systems/Web/CLI/Embedded)
- **Edition**: 2021
- **Database**: {{DATABASE}}

## 🔧 Rust Project Structure

```
project/
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── bin/
│   │   ├── server.rs
│   │   └── cli.rs
│   ├── modules/
│   │   ├── auth.rs
│   │   ├── models.rs
│   │   └── services.rs
│   ├── tests/
│   ├── integration_tests/
│   └── benches/
├── Cargo.toml
├── Cargo.lock
└── README.md
```

## 🚀 Rust Setup

### Cargo.toml
```toml
[package]
name = "{{PROJECT_NAME}}"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1", features = ["full"] }
axum = "0.7"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
sqlx = { version = "0.7", features = ["postgres", "runtime-tokio-native-tls"] }
tracing = "0.1"
tracing-subscriber = "0.3"

[dev-dependencies]
tokio-test = "0.4"
```

### Axum Web Server Example
```rust
// src/main.rs
use axum::{
    extract::{Path, Json},
    routing::{get, post},
    Router,
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tokio::net::TcpListener;

#[derive(Debug, Serialize, Deserialize)]
struct User {
    id: u64,
    email: String,
    name: String,
}

#[derive(Debug, Deserialize)]
struct CreateUserRequest {
    email: String,
    name: String,
}

async fn create_user(
    Json(payload): Json<CreateUserRequest>,
) -> (StatusCode, Json<User>) {
    let user = User {
        id: 1,
        email: payload.email,
        name: payload.name,
    };

    (StatusCode::CREATED, Json(user))
}

async fn get_user(Path(id): Path<u64>) -> Json<User> {
    Json(User {
        id,
        email: "user@example.com".to_string(),
        name: "User Name".to_string(),
    })
}

async fn health() -> &'static str {
    "healthy"
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/users", post(create_user))
        .route("/api/users/:id", get(get_user));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = TcpListener::bind(&addr).await.unwrap();

    println!("Server running on {}", addr);

    axum::serve(listener, app).await.unwrap();
}
```

### Error Handling Pattern
```rust
// src/error.rs
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    NotFound,
    Unauthorized,
    ValidationError(String),
    DatabaseError(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::NotFound => (StatusCode::NOT_FOUND, "Resource not found"),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized"),
            AppError::ValidationError(msg) => {
                (StatusCode::BAD_REQUEST, &msg)
            },
            AppError::DatabaseError(msg) => {
                (StatusCode::INTERNAL_SERVER_ERROR, &msg)
            },
        };

        let body = Json(json!({
            "error": error_message,
            "status": status.as_u16(),
        }));

        (status, body).into_response()
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
```

## ✅ Testing Strategy

### Rust Unit Tests
```rust
// tests/user_tests.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_creation() {
        let user = User {
            id: 1,
            email: "test@example.com".to_string(),
            name: "Test User".to_string(),
        };

        assert_eq!(user.email, "test@example.com");
    }

    #[tokio::test]
    async fn test_create_user_endpoint() {
        let app = create_app();

        let response = app
            .oneshot(Request::builder()
                .method("POST")
                .uri("/api/users")
                .body(Body::from(r#"{"email":"test@example.com","name":"Test"}"#))
                .unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::CREATED);
    }
}
```

## 🧠 Memory Management

```bash
npx @claude-flow/cli@latest memory store --key "rust-patterns-{{PROJECT_NAME}}" \
  --value "Ownership rules, async patterns, error handling" \
  --namespace rust --tags "systems,patterns"
```

## 🎯 Performance Targets

- Binary size: <50MB
- Memory overhead: <10MB
- Concurrency: 1000+ connections
- Latency: <100ms p99

## 📋 Rust Checklist

- [ ] Rust toolchain installed
- [ ] Project structure configured
- [ ] Dependencies managed in Cargo.toml
- [ ] Web framework integrated
- [ ] Database access configured
- [ ] Error handling implemented
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Documentation generated (cargo doc)
- [ ] Performance benchmarks configured
- [ ] Security best practices applied
- [ ] Build optimization configured
- [ ] Deployment prepared

---

**Generated from**: claude-flow CLAUDE.md Rust Development Template
