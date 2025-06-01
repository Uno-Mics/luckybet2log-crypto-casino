
-- Function to safely reset all PHP balances
CREATE OR REPLACE FUNCTION reset_all_php_balances()
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles SET php_balance = 0;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error resetting all PHP balances: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely reset all coins
CREATE OR REPLACE FUNCTION reset_all_coins()
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles SET coins = 0;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error resetting all coins: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely reset all ITLOG tokens
CREATE OR REPLACE FUNCTION reset_all_itlog_tokens()
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles SET itlog_tokens = 0;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error resetting all ITLOG tokens: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely reset all balances
CREATE OR REPLACE FUNCTION reset_all_balances()
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles SET php_balance = 0, coins = 0, itlog_tokens = 0;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error resetting all balances: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
