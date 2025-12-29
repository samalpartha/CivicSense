# Eraser.io Diagram Code

Copy and paste the following code blocks into [Eraser.io](https://app.eraser.io) to generate beautiful, high-fidelity architecture diagrams.

## 1. High-Level System Architecture

```eraser
// Nodes
Group "Client Layer" {
  User [icon: user]
  WebFrontend [label: "React Frontend", icon: react]
  MobileApp [label: "Mobile App", icon: mobile]
}

Group "Backend Services" {
  FastAPI [label: "FastAPI Gateway", icon: python]
  Orchestrator [label: "Agent Orchestrator", icon: server]
  VectorDB [label: "MongoDB Atlas", icon: database]
}

Group "Confluent Cloud" {
  Kafka [label: "Kafka Topics", icon: apachekafka]
  Flink [label: "Flink SQL Engine", icon: apacheflink]
  Connectors [icon: plug]
}

Group "Google Cloud" {
  Gemini [label: "Gemini 2.0 Flash", icon: googlecloud]
  Vertex [label: "Vertex AI Agents", icon: googlecloud]
}

// Connections
User > WebFrontend
WebFrontend > FastAPI : "WebSocket / HTTP"
FastAPI > Kafka : "Produce Events"
Kafka > Flink : "Stream"
Flink > FastAPI : "Aggregates"
FastAPI > Orchestrator : "Query"
Orchestrator > Gemini : "Reasoning"
Orchestrator > VectorDB : "RAG"
Gemini > Vertex : "Context"
```

## 2. Backend Architecture (Detailed)

```eraser
// Nodes
Group "FastAPI App" {
  APIRouter [label: "API Router", icon: globe]
  WSManager [label: "WebSocket Manager", icon: terminal]
  Pydantic [label: "Data Models", icon: code]
}

Group "Multi-Agent System" {
  QueryHandler [icon: server]
  TriageAgent [icon: bot]
  ImpactAgent [icon: alert]
  GuidanceAgent [icon: document]
}

Group "Integrations" {
  MongoVector [label: "MongoDB Vector", icon: database]
  KafkaConsumer [label: "Kafka Manager", icon: apachekafka]
  OpenMeteo [label: "Weather API", icon: cloud]
}

// Connections
APIRouter > QueryHandler : "HTTP Request"
WSManager > QueryHandler : "WS Message"
QueryHandler > TriageAgent : "Classify"
TriageAgent > ImpactAgent : "Assess Severity"
ImpactAgent > GuidanceAgent : "Generate Response"
GuidanceAgent > MongoVector : "Vector Search"
GuidanceAgent > TriageAgent : "Feedback"
KafkaConsumer > WSManager : "Live Updates"
APIRouter > OpenMeteo : "Context"
```

## 3. Frontend Architecture

```eraser
// Nodes
Group "Frontend App" {
  Main [label: "main.tsx", icon: typescript]
  Router [label: "React Router", icon: route]
}

Group "Components" {
  Sidebar [icon: layout]
  Map [label: "Leaflet Map", icon: map]
  Chat [label: "AI Copilot", icon: message-circle]
  Dashboard [icon: activity]
}

Group "State & Services" {
  AuthCtx [label: "Auth Context", icon: lock]
  WSCtx [label: "WebSocket Context", icon: plug]
  APIClient [label: "Axios", icon: globe]
}

// Connections
Main > Router
Router > Sidebar
Router > Map
Router > Chat
Router > Dashboard

Chat > WSCtx
Dashboard > WSCtx
Map > APIClient
WSCtx > APIClient
```
