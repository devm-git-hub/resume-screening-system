import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

export const runMatching = createAsyncThunk("match/run", async (jobId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/matches/run/${jobId}`);
    toast.success("Candidate matching complete");
    return data.data;
  } catch (err) {
    toast.error("Matching failed");
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMatchesForJob = createAsyncThunk(
  "match/fetchForJob",
  async ({ jobId, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/matches/job/${jobId}`, { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchMatchesForCandidate = createAsyncThunk(
  "match/fetchForCandidate",
  async (candidateId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/matches/candidate/${candidateId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const matchSlice = createSlice({
  name: "match",
  initialState: { rankedCandidates: [], myMatches: [], pagination: {}, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(runMatching.pending, (state) => { state.loading = true; })
      .addCase(runMatching.fulfilled, (state, action) => {
        state.loading = false;
        state.rankedCandidates = action.payload;
      })
      .addCase(fetchMatchesForJob.fulfilled, (state, action) => {
        state.rankedCandidates = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMatchesForCandidate.fulfilled, (state, action) => {
        state.myMatches = action.payload;
      });
  },
});

export default matchSlice.reducer;
