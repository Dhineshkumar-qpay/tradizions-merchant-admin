import React, { useState, useEffect } from "react";
import {
  Phone,
  Lock,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Login.css";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  // Redirect to dashboard if token exists
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Handle countdown for resending OTP
  useEffect(() => {
    let interval = null;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length <= 10) {
      setPhone(value);
      if (error) setError("");
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length <= 6) {
      setOtp(value);
      if (error) setError("");
    }
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.post(APIROUTES.SENDOTP, { phone });
      console.log("Send OTP API response:", response.data);

      setSuccess(`Verification code sent to ${phone}`);
      setStep("otp");
      setResendTimer(30);
    } catch (err) {
      console.error("Send OTP Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to send OTP. Please check the mobile number and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter a valid verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const body = {
        phone,
        otp: parseInt(otp, 10),
      };
      console.log("Verifying OTP with body:", body);
      const response = await API.post(APIROUTES.VERIFYOTP, body);
      console.log("Verify OTP API response:", response.data);

      const token = response.data?.data?.token || response.data?.token;

      if (!token) {
        throw new Error("Authentication token not found in response.");
      }

      localStorage.setItem("token", token);

      if (response.data?.data?.userid) {
        localStorage.setItem("userid", String(response.data.data.userid));
      }
      if (response.data?.data?.role) {
        localStorage.setItem("role", response.data.data.role);
      }

      setSuccess("Authenticated successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Verify OTP Error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await API.post(APIROUTES.SENDOTP, { phone });
      setSuccess("OTP resent successfully!");
      setResendTimer(30);
    } catch (err) {
      console.error("Resend OTP Error:", err);
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setStep("phone");
    setOtp("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="login-wrapper">
      <div className="login-geometric-bg">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="login-card">
        <div className="login-brand">
          <div className="brand-icon-circle">
            <img
              src="/src/assets/app-logo.png"
              onError={(e) => {
                e.target.style.display = "none";
              }}
              alt="Logo"
              height={60}
              width={150}
            />
          </div>
          <h2>Tradizions Admin</h2>
          <p>{step === "phone" ? "Secure Login Portal" : "OTP Verification"}</p>
        </div>

        {error && (
          <div className="login-alert error animate-pop">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="login-alert success animate-pop">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="steps-container">
          {step === "phone" ? (
            <form
              onSubmit={handleSendOTP}
              className="login-form animate-fade-in"
            >
              <div className="input-group">
                <label>Mobile Number</label>
                <div className="input-field">
                  <span className="input-prefix">+91</span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    maxLength={10}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    required
                    autoFocus
                  />
                  <span className="field-icon">
                    <Phone size={18} />
                  </span>
                </div>
                <small className="field-help">
                  We'll send a 6-digit OTP to verify your account
                </small>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-spinner-content">
                    <RefreshCw className="spinner" size={18} />
                    SENDING OTP...
                  </span>
                ) : (
                  "GET OTP CODE"
                )}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyOTP}
              className="login-form animate-fade-in"
            >
              <div className="back-to-phone">
                <button
                  type="button"
                  className="btn-back-text"
                  onClick={handleGoBack}
                  disabled={loading}
                >
                  <ArrowLeft size={16} />
                  <span>Change number ({phone})</span>
                </button>
              </div>

              <div className="input-group">
                <label>Verification Code</label>
                <div className="input-field code-input-field">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    maxLength={6}
                    onChange={handleOtpChange}
                    disabled={loading}
                    required
                    autoFocus
                  />
                  <span className="field-icon">
                    <Lock size={18} />
                  </span>
                </div>

                <div className="otp-meta">
                  {resendTimer > 0 ? (
                    <span className="timer-text">
                      Resend code in <strong>{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn-resend"
                      onClick={handleResendOTP}
                      disabled={loading}
                    >
                      <RefreshCw size={12} />
                      Resend OTP Code
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-spinner-content">
                    <RefreshCw className="spinner" size={18} />
                    VERIFYING...
                  </span>
                ) : (
                  "VERIFY & SIGN IN"
                )}
              </button>
            </form>
          )}
        </div>

        <div className="login-footer">
          <p>© 2026 Tradizions Group. Secure Admin Access.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
