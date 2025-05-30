
-- Function to sell a pet for ITLOG tokens
CREATE OR REPLACE FUNCTION sell_pet(
  p_user_id UUID,
  p_pet_id UUID
) RETURNS JSON AS $$
DECLARE
  v_pet_record RECORD;
  v_pet_type_record RECORD;
  v_base_price INTEGER;
  v_rarity_multiplier DECIMAL(4,2);
  v_scarcity_multiplier DECIMAL(4,2);
  v_final_price INTEGER;
BEGIN
  -- Get pet information
  SELECT up.*, pt.* INTO v_pet_record
  FROM user_pets up
  JOIN pet_types pt ON up.pet_type_id = pt.id
  WHERE up.id = p_pet_id AND up.user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Pet not found or not owned by user');
  END IF;
  
  -- Cannot sell active pets
  IF v_pet_record.is_active THEN
    RETURN json_build_object('success', false, 'error', 'Cannot sell active pets. Remove from garden first.');
  END IF;
  
  -- Base prices by rarity
  CASE v_pet_record.rarity
    WHEN 'common' THEN v_base_price := 5;
    WHEN 'uncommon' THEN v_base_price := 25;
    WHEN 'rare' THEN v_base_price := 75;
    WHEN 'legendary' THEN v_base_price := 750;
    WHEN 'mythical' THEN v_base_price := 7500;
    ELSE v_base_price := 5;
  END CASE;
  
  -- Rarity multiplier (higher rarity = higher value)
  CASE v_pet_record.rarity
    WHEN 'common' THEN v_rarity_multiplier := 1.0;
    WHEN 'uncommon' THEN v_rarity_multiplier := 1.5;
    WHEN 'rare' THEN v_rarity_multiplier := 2.0;
    WHEN 'legendary' THEN v_rarity_multiplier := 3.0;
    WHEN 'mythical' THEN v_rarity_multiplier := 5.0;
    ELSE v_rarity_multiplier := 1.0;
  END CASE;
  
  -- Scarcity multiplier (lower drop rate = higher value)
  -- For drop rates like 0.4, 0.3, 0.2, etc.
  v_scarcity_multiplier := GREATEST(1.0, (1.0 / v_pet_record.drop_rate));
  
  -- Calculate final price
  v_final_price := FLOOR(v_base_price * v_rarity_multiplier * v_scarcity_multiplier);
  
  -- Delete the pet
  DELETE FROM user_pets WHERE id = p_pet_id;
  
  -- Add tokens to user balance
  UPDATE profiles
  SET itlog_tokens = itlog_tokens + v_final_price
  WHERE user_id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'pet_name', v_pet_record.name,
    'pet_emoji', v_pet_record.sprite_emoji,
    'rarity', v_pet_record.rarity,
    'tokens_earned', v_final_price,
    'drop_rate', v_pet_record.drop_rate,
    'base_price', v_base_price,
    'rarity_multiplier', v_rarity_multiplier,
    'scarcity_multiplier', v_scarcity_multiplier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
