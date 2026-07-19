import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

export const createJob = createAsyncThunk("job/create", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/jobs", payload);
    toast.success("Job posted successfully");
    return data.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to post job");
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchJobs = createAsyncThunk("job/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/jobs", { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchJobById = createAsyncThunk("job/fetchOne", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/jobs/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const jobSlice = createSlice({
  name: "job",
  initialState: { list: [], pagination: {}, current: null, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      });
  },
});

export default jobSlice.reducer;
