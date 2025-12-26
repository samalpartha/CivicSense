-- Real-time severity escalation detection
-- Triggers alerts when multiple critical events occur in same area

CREATE TABLE severity_alerts (
    alert_id STRING PRIMARY KEY NOT ENFORCED,
    area STRING,
    critical_event_count BIGINT,
    event_details STRING,
    alert_timestamp TIMESTAMP(3),
    requires_immediate_action BOOLEAN
)
WITH (
    'changelog.mode' = 'append',
    'value.format' = 'json-registry',
    'key.format' = 'json-registry'
);

-- Detect and create alerts for areas with multiple critical events
INSERT INTO severity_alerts
SELECT 
    CONCAT('ALERT-', area, '-', CAST(UNIX_TIMESTAMP() AS STRING)) as alert_id,
    area,
    COUNT(*) as critical_event_count,
    LISTAGG(CONCAT(type, ': ', message), ' | ') as event_details,
    CURRENT_TIMESTAMP as alert_timestamp,
    CASE 
        WHEN COUNT(*) >= 3 THEN true
        ELSE false
    END as requires_immediate_action
FROM emergency_events
WHERE severity IN ('critical', 'high')
GROUP BY area, TUMBLE(TO_TIMESTAMP(timestamp), INTERVAL '10' MINUTES)
HAVING COUNT(*) >= 2;

