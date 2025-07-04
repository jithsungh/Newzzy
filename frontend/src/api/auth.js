import api from "./axios";

const signup = async (userData, setLogin) => {
  try {
    const response = await api.post(
      "/auth/signup",
      userData
    );

    if (response.status === 201) {
      console.log("Signup successful:", response.message);
      const { AccessToken, user } = response.data;
      setLogin(user, AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Signup failed",
    };
  }
};

const login = async (credentials, setLogin) => {
  try {
    const response = await api.post("/auth/login", credentials);

    if (response.status === 200) {
      console.log("Login successful:", response.data);
      const { AccessToken, user } = response.data;
      setLogin(user, AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Login failed",
    };
  }
};

const logout = async (setLogout) => {
  try {
    const response = await api.post("/auth/logout");

    if (response.status === 200) {
      setLogout();
      return { success: true };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Logout failed",
    };
  }
};

export { signup, login, logout };
