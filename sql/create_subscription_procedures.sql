-- Kontrollera om en användare har en prenumeration
CREATE OR REPLACE FUNCTION check_subscription_exists(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM subscriptions WHERE user_id = user_id_param
  ) INTO subscription_exists;
  
  RETURN subscription_exists;
END;
$$;

-- Uppdatera en befintlig prenumeration
CREATE OR REPLACE FUNCTION update_subscription(
  user_id_param UUID,
  plan_param TEXT,
  status_param TEXT,
  is_lifetime_param BOOLEAN,
  expires_at_param TIMESTAMP WITH TIME ZONE,
  updated_at_param TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  UPDATE subscriptions
  SET 
    plan = plan_param,
    status = status_param,
    is_lifetime = is_lifetime_param,
    expires_at = expires_at_param,
    updated_at = updated_at_param
  WHERE user_id = user_id_param
  RETURNING to_jsonb(subscriptions.*) INTO result;
  
  RETURN result;
END;
$$;

-- Skapa en ny prenumeration
CREATE OR REPLACE FUNCTION insert_subscription(
  user_id_param UUID,
  plan_param TEXT,
  status_param TEXT,
  starts_at_param TIMESTAMP WITH TIME ZONE,
  expires_at_param TIMESTAMP WITH TIME ZONE,
  is_lifetime_param BOOLEAN,
  created_at_param TIMESTAMP WITH TIME ZONE,
  updated_at_param TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  INSERT INTO subscriptions (
    user_id,
    plan,
    status,
    starts_at,
    expires_at,
    is_lifetime,
    created_at,
    updated_at
  )
  VALUES (
    user_id_param,
    plan_param,
    status_param,
    starts_at_param,
    expires_at_param,
    is_lifetime_param,
    created_at_param,
    updated_at_param
  )
  RETURNING to_jsonb(subscriptions.*) INTO result;
  
  RETURN result;
END;
$$; 