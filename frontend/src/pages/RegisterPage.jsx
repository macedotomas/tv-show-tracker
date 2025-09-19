import React, {Fragment, useState} from "react";
import { Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Tv, Sparkles, UserPlus } from "lucide-react";
import { toast } from 'react-toastify'


const Register = ({setAuth}) => {

  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { username, email, password } = inputs;

  const onChange = e => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async e => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const body = { username, email, password };

      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify(body)
      });

      const parseRes = await response.json();
      
      // parseRes.data will contain the token if registration was successful
      if (parseRes?.data) {
        localStorage.setItem("token", parseRes.data);
        setAuth(true);
        toast.success("Registered Successfully!");
      } else {
        setAuth(false);
        toast.error(parseRes?.message || "Registration Failed. Please try again.");
      }
    } catch (err) {
      console.error(err.message);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }; 
  
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-card flex items-center justify-center p-2 sm:p-4 overflow-hidden fixed inset-0">
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 right-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10 max-h-full overflow-hidden flex flex-col justify-center">
        
        {/* Header */}
        <div className="text-center mb-2 sm:mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-secondary to-accent rounded-2xl shadow-xl mb-2 sm:mb-3 relative">
            <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent mb-1">
            Join TV Show Tracker
          </h1>
          <p className="text-white/80 text-xs sm:text-sm lg:text-base">Create your account to start tracking</p>
        </div>

        {/* Register Card */}
        <div className="card bg-base-100/90 backdrop-blur-sm shadow-2xl border border-base-300/50 flex-shrink-0">
          <div className="card-body p-3 sm:p-4 lg:p-6">
            
            <form onSubmit={onSubmitForm} className="space-y-3 sm:space-y-4">
              
              {/* Username Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm sm:text-base font-medium text-white/90">Username</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/50" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={onChange}
                    className="input input-bordered w-full pl-8 sm:pl-10 py-2 bg-base-100 border-base-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 text-base-content placeholder:text-base-content/60 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm sm:text-base font-medium text-white/90">Email Address</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/50" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={onChange}
                    className="input input-bordered w-full pl-8 sm:pl-10 py-2 bg-base-100 border-base-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 text-base-content placeholder:text-base-content/60 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm sm:text-base font-medium text-white/90">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/50" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={onChange}
                    className="input input-bordered w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 bg-base-100 border-base-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 text-base-content placeholder:text-base-content/60 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-secondary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/50" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/50" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`btn btn-secondary w-full py-2 text-sm sm:text-base lg:text-lg font-semibold shadow-lg hover:shadow-secondary/25 transition-all duration-200 ${
                  isLoading ? 'loading' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="divider my-2 sm:my-3">
              <span className="text-white/60 text-xs sm:text-sm">Already have an account?</span>
            </div>

            {/* Login Link */}
            <Link
              to="/login"
              className="btn btn-outline btn-primary w-full py-2 text-sm sm:text-base lg:text-lg font-semibold hover:scale-105 transition-all duration-200"
            >
              Sign In Instead
            </Link>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-2 sm:mt-4 text-white/60 flex-shrink-0">
          <p className="text-xs sm:text-sm">
            Start your journey • Track favorites • Discover amazing shows
          </p>
        </div>

      </div>
    </div>
  ); 
};

export default Register;