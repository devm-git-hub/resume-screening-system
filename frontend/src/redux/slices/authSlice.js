// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../services/api";
// import toast from "react-hot-toast";

// export const registerUser = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
//   try {
//     const { data } = await api.post("/auth/register", payload);
//     return data.data;
//   } catch (err) {
//     return rejectWithValue(err.response?.data?.message || "Registration failed");
//   }
// });

// export const loginUser = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
//   try {
//     const { data } = await api.post("/auth/login", payload);
//     return data.data;
//   } catch (err) {
//     return rejectWithValue(err.response?.data?.message || "Login failed");
//   }
// });

// export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
//   try {
//     const { data } = await api.get("/auth/me");
//     return data.data;
//   } catch (err) {
//     return rejectWithValue(err.response?.data?.message);
//   }
// });

// const initialState = {
//   user: JSON.parse(localStorage.getItem("user")) || null,
//   isAuthenticated: !!localStorage.getItem("accessToken"),
//   loading: false,
//   error: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//       localStorage.removeItem("user");
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.isAuthenticated = true;
//         localStorage.setItem("accessToken", action.payload.accessToken);
//         localStorage.setItem("refreshToken", action.payload.refreshToken);
//         localStorage.setItem("user", JSON.stringify(action.payload.user));
//         toast.success("Logged in successfully");
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         toast.error(action.payload);
//       })
//       .addCase(registerUser.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(registerUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.isAuthenticated = true;
//         localStorage.setItem("accessToken", action.payload.accessToken);
//         localStorage.setItem("refreshToken", action.payload.refreshToken);
//         localStorage.setItem("user", JSON.stringify(action.payload.user));
//         toast.success("Account created successfully");
//       })
//       .addCase(registerUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         toast.error(action.payload);
//       });
//   },
// });

// export const { logout } = authSlice.actions;
// export default authSlice.reducer;



import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

const makeAuthThunk = (type, url, fallbackMessage) =>
  createAsyncThunk(type, async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(url, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || fallbackMessage);
    }
  });

export const registerUser = makeAuthThunk("auth/register", "/auth/register", "Registration failed");
export const loginUser = makeAuthThunk("auth/login", "/auth/login", "Login failed");

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const SESSION_KEYS = ["accessToken", "refreshToken", "user"];
const persistSession = ({ user, accessToken, refreshToken }) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", JSON.stringify(user));
};
const clearSession = () => SESSION_KEYS.forEach((k) => localStorage.removeItem(k));

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  error: null,
};

const onPending = (state) => {
  state.loading = true;
  state.error = null;
};
const onFulfilled = (message) => (state, action) => {
  state.loading = false;
  state.user = action.payload.user;
  state.isAuthenticated = true;
  persistSession(action.payload);
  toast.success(message);
};
const onRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  toast.error(action.payload);
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      clearSession();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, onPending)
      .addCase(loginUser.fulfilled, onFulfilled("Logged in successfully"))
      .addCase(loginUser.rejected, onRejected)
      .addCase(registerUser.pending, onPending)
      .addCase(registerUser.fulfilled, onFulfilled("Account created successfully"))
      .addCase(registerUser.rejected, onRejected);
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;