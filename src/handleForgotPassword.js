import { supabase } from './supabase';

const handleForgotPassword = async (email) => {
  if (!email) {
    alert("Please enter your email address first.");
    return;
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://MadEthan6.github.io/peosta-cleaning-services/',
  });
  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Password reset email sent!");
  }
};

export default handleForgotPassword;