import api from "./axios";


const editName = async (name,setLogin) => {
  try {
    const response = await api.put("/profile/editname", { name });
    if (response.status === 200) {
      console.log("Name changed successfully:", response.data);
      const { AccessToken,user } = response.data;
      setLogin(user,AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Name change error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An error occurred while changing the name.",
    };
  }
};

const changeEmail = async (email,setLogin) => {
  try {
    const response = await api.put("/profile/changeemail", { email });
    if (response.status === 200) {
      console.log("Email changed successfully:", response.data);
      const { AccessToken,user } = response.data;
      setLogin(user,AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Email change error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An error occurred while changing the email.",
    };
  }
};

const changePassword = async (old_password, new_password) => {
  try {
    const response = await api.put("/profile/changepassword", {
      old_password,
      new_password,
    });
    if (response.status === 200) {
      console.log("Password changed successfully:", response.data);
      const { AccessToken } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Password change error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An error occurred while changing the password.",
    };
  }
};

const toggleTheme = async (theme,setLogin) =>{
    try {
        const response = await api.put("/profile/toggletheme", { theme });
        if (response.status === 200) {
        console.log("Theme changed successfully:", response.data);
        const { user,AccessToken } = response.data;
        setLogin(user,AccessToken);
        return { success: true, data: response.data };
        }
        return { success: false, error: response.data.error };
    } catch (error) {
        console.error("Theme change error:", error);
        return {
        success: false,
        error: error.response?.data?.message || "An error occurred while changing the theme.",
        };
    }
};

const resetInterests = async (setLogin) => {
    try {
        const response = await api.put("/profile/resetinterests");
        if (response.status === 200) {
            console.log("Interests reset successfully:", response.data);
            const { user,AccessToken } = response.data;
            setLogin(user,AccessToken);
            return { success: true, data: response.data };
        }
        return { success: false, error: response.data.error };
    } catch (error) {
        console.error("Interest reset error:", error);
        return {
            success: false,
            error: error.response?.data?.message || "An error occurred while resetting interests.",
        };
    }
};

const updateProfilePicture = async (profile_url,setLogin) => {
    try {
        const response = await api.put("/profile/updateprofilepicture", { profile_url });
        if (response.status === 200) {
            console.log("Profile picture updated successfully:", response.data);
            const { user,AccessToken } = response.data;
            setLogin(user,AccessToken);
            return { success: true, data: response.data };
        }
        return { success: false, error: response.data.error };
    } catch (error) {
        console.error("Profile picture update error:", error);
        return {
            success: false,
            error: error.response?.data?.message || "An error occurred while updating the profile picture.",
        };
    }
};

const deleteAccount = async (setLogout) => {
    try {
        const response = await api.delete("/profile/deleteaccount");
        if (response.status === 200) {
            console.log("Account deleted successfully:", response.data);
            setLogout();
            return { success: true, data: response.data };
        }
        return { success: false, error: response.data.error };
    } catch (error) {
        console.error("Account deletion error:", error);
        return {
            success: false,
            error: error.response?.data?.message || "An error occurred while deleting the account.",
        };
    }
};

const setInterests =async(interests,setLogin) => {
    try {
        const response = await api.post("/profile/setinterests", { interests });
        if (response.status === 200) {
            console.log("Interests updated successfully:", response.data);
            const { user,AccessToken } = response.data;
            setLogin(user,AccessToken);
            return { success: true, data: response.data };
        }
        return { success: false, error: response.data.error };
    } catch (error) {
        console.error("Interest update error:", error);
        return {
            success: false,
            error: error.response?.data?.message || "An error occurred while updating interests.",
        };
    }
};

export {
  editName,
  changePassword,
  toggleTheme,
  resetInterests,
  updateProfilePicture,
  deleteAccount,
  setInterests,
  changeEmail
};
