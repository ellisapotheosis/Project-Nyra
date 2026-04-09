# CLAUDE.md Template: AI/ML Projects

**Project Type**: Machine Learning Systems
**Framework**: {{FRAMEWORK}} (TensorFlow/PyTorch/Scikit-learn)
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**ML projects require specialized agents:**

1. **Data Engineer**: Data pipeline and preprocessing
2. **ML Engineer**: Model development and training
3. **MLOps Engineer**: Pipeline automation and deployment
4. **ML Researcher**: Experimentation and optimization

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn ML-specialized agents
npx @claude-flow/cli@latest agent spawn -t coder --name ml-engineer --capabilities "tensorflow,pytorch,scikit-learn,training"
npx @claude-flow/cli@latest agent spawn -t coder --name data-engineer --capabilities "pandas,numpy,data-pipeline"
npx @claude-flow/cli@latest agent spawn -t coder --name mlops-engineer --capabilities "mlflow,kubeflow,model-deployment"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **ML Task**: {{TASK_TYPE}} (Classification/Regression/NLP/Vision/Clustering)
- **Primary Framework**: {{FRAMEWORK}}
- **Data Source**: {{DATA_SOURCE}}
- **Target Metric**: {{TARGET_METRIC}}

## 🔧 Development Patterns & Standards

### ML Project Structure
```
ml-project/
├── data/
│   ├── raw/              # Original data
│   ├── processed/        # Cleaned data
│   ├── splits/           # Train/val/test
│   └── metadata.json     # Data documentation
├── notebooks/
│   ├── 01-exploration.ipynb
│   ├── 02-preprocessing.ipynb
│   └── 03-training.ipynb
├── src/
│   ├── data/
│   │   ├── loader.py
│   │   ├── preprocessor.py
│   │   └── augmentation.py
│   ├── models/
│   │   ├── base_model.py
│   │   ├── custom_layers.py
│   │   └── architectures/
│   ├── training/
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   └── callbacks.py
│   ├── inference/
│   │   ├── predictor.py
│   │   └── batch_predict.py
│   ├── utils/
│   └── config.py
├── models/               # Trained models
├── results/
│   ├── metrics/
│   ├── plots/
│   └── reports/
├── tests/
├── requirements.txt
└── README.md
```

## 🐝 Swarm Orchestration

### Phase 1: Exploratory Data Analysis
- **Duration**: 3-5 days
- **Agents**: Data Engineer, ML Engineer
- **Output**: Data understanding report, preprocessing strategy

### Phase 2: Data Preprocessing & Feature Engineering
- **Duration**: 5-10 days
- **Agents**: Data Engineer
- **Focus**: Cleaning, transformation, feature creation

### Phase 3: Model Development
- **Duration**: 10-20 days
- **Agents**: ML Engineer, ML Researcher
- **Focus**: Architecture design, hyperparameter tuning

### Phase 4: Model Training & Optimization
- **Duration**: 5-15 days
- **Agents**: ML Engineer, MLOps Engineer
- **Focus**: Training, monitoring, optimization

### Phase 5: Evaluation & Deployment
- **Duration**: 5-10 days
- **Agents**: ML Engineer, MLOps Engineer
- **Focus**: Testing, versioning, production deployment

## 🧠 Memory Management

### Store Data Insights
```bash
npx @claude-flow/cli@latest memory store --key "data-insights-{{PROJECT_NAME}}" \
  --value "Data distribution, anomalies, feature correlations" \
  --namespace data --tags "ml,data,{{PROJECT_NAME}}"
```

### Store Model Experiments
```bash
npx @claude-flow/cli@latest memory store --key "model-experiments-{{PROJECT_NAME}}" \
  --value "Architectures tried, hyperparameters, metrics" \
  --namespace ml --tags "experiments,models"
```

### Store Preprocessing Pipeline
```bash
npx @claude-flow/cli@latest memory store --key "preprocessing-pipeline-{{PROJECT_NAME}}" \
  --value "Scaling strategy, feature engineering steps, validation approach" \
  --namespace pipeline --tags "preprocessing,data"
```

## 🚀 Training & Deployment

### Training Pipeline
```python
# config.py
TRAINING_CONFIG = {
    "batch_size": 32,
    "epochs": 100,
    "learning_rate": 0.001,
    "optimizer": "adam",
    "loss": "categorical_crossentropy",
    "metrics": ["accuracy"],
    "validation_split": 0.2,
    "early_stopping_patience": 10,
}

# train.py
from src.training.train import train_model
from src.models import build_model
from src.data.loader import load_data

# Load data
train_data, val_data, test_data = load_data()

# Build model
model = build_model()

# Train
history = train_model(model, train_data, val_data, TRAINING_CONFIG)

# Evaluate
metrics = model.evaluate(test_data)
```

### Model Registry & Versioning
```bash
# MLflow tracking
mlflow.set_experiment("{{PROJECT_NAME}}")
mlflow.start_run()
mlflow.log_param("learning_rate", 0.001)
mlflow.log_metric("accuracy", 0.95)
mlflow.sklearn.log_model(model, "model")
mlflow.end_run()

# Model versioning
mlflow.register_model("runs:/<RUN_ID>/model", "{{PROJECT_NAME}}-model")
```

## 📊 Monitoring & Analytics

### Training Metrics
- Loss convergence
- Accuracy/Precision/Recall/F1
- Overfitting detection
- Training time and resources

### Model Performance Monitoring
- Prediction latency
- Throughput (predictions/sec)
- Model drift detection
- Feature drift monitoring

### Data Quality Monitoring
- Data distribution changes
- Missing values tracking
- Outlier detection
- Schema validation

## 🔒 Security & Compliance

### Model Security
- Model versioning and lineage
- Sensitive data handling
- Model artifact encryption
- Access control

### Bias & Fairness
- Fairness metrics evaluation
- Bias detection
- Explainability analysis (LIME/SHAP)
- Model card documentation

## ✅ Testing Strategy

### Unit Tests
```
tests/
├── test_data_loader.py
├── test_preprocessor.py
├── test_model.py
└── test_inference.py
```

### Integration Tests
- End-to-end pipeline testing
- Data → Training → Inference
- Cross-framework compatibility

### Model Validation
- Cross-validation
- Bootstrap validation
- Test set evaluation
- Benchmark comparisons

## 🎯 Performance Targets

- Model accuracy: {{TARGET_ACCURACY}}%
- Training time: <{{TARGET_TRAINING_TIME}}
- Inference latency: <{{TARGET_LATENCY}}ms
- Model size: <{{TARGET_MODEL_SIZE}}MB
- Data throughput: >{{TARGET_THROUGHPUT}} samples/sec

## 📋 Development Checklist

- [ ] Data acquisition and exploration complete
- [ ] Data preprocessing pipeline implemented
- [ ] Feature engineering completed
- [ ] Baseline model established
- [ ] Main models trained and tuned
- [ ] Hyperparameter optimization done
- [ ] Cross-validation and testing complete
- [ ] Model evaluation and comparison done
- [ ] Inference pipeline created
- [ ] Model deployment configured
- [ ] Monitoring and alerting set up
- [ ] Documentation and model card completed
- [ ] Ethical AI review completed

---

**Generated from**: claude-flow CLAUDE.md AI/ML Projects Template
