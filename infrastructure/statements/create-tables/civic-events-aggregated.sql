-- Real-time aggregation of civic events by area and severity
-- Demonstrates Confluent Flink windowing and stream processing

CREATE TABLE civic_events_aggregated (
    area STRING,
    severity STRING,
    event_count BIGINT,
    event_types ARRAY<STRING NOT NULL>,
    window_start TIMESTAMP(3),
    window_end TIMESTAMP(3),
    PRIMARY KEY (area, severity, window_start) NOT ENFORCED
) 
WITH (
    'changelog.mode' = 'retract',
    'value.format' = 'json-registry',
    'key.format' = 'json-registry'
);

-- Populate with real-time aggregations from emergency events
INSERT INTO civic_events_aggregated
SELECT 
    area,
    severity,
    COUNT(*) as event_count,
    COLLECT(DISTINCT type) as event_types,
    TUMBLE_START(timestamp_col, INTERVAL '5' MINUTES) as window_start,
    TUMBLE_END(timestamp_col, INTERVAL '5' MINUTES) as window_end
FROM (
    SELECT 
        area,
        severity,
        type,
        TO_TIMESTAMP(timestamp) as timestamp_col
    FROM emergency_events
)
GROUP BY 
    area,
    severity,
    TUMBLE(timestamp_col, INTERVAL '5' MINUTES);

