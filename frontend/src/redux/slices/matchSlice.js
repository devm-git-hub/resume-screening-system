import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";
import { deleteResume, uploadResume } from "./resumeSlice";

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

// Fetches the LOGGED-IN candidate's own matches - no candidateId needed.
export const fetchMyMatches = createAsyncThunk(
  "match/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/matches/mine");
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
      .addCase(runMatching.rejected, (state) => { state.loading = false; })
      .addCase(fetchMatchesForJob.fulfilled, (state, action) => {
        state.rankedCandidates = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyMatches.pending, (state) => { state.loading = true; })
      .addCase(fetchMyMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.myMatches = action.payload;
      })
      .addCase(fetchMyMatches.rejected, (state) => { state.loading = false; })
      // After an upload, put the new resume's matches into the candidate's list
      // (replacing any older matches from the same resume), best score first.
      .addCase(uploadResume.fulfilled, (state, action) => {
        const newId = String(action.payload.resume._id);
        const others = state.myMatches.filter((m) => String(m.resume) !== newId);
        state.myMatches = [...action.payload.matches, ...others].sort(
          (a, b) => b.finalMatchPercentage - a.finalMatchPercentage
        );
      })
      // When a resume is deleted, drop the matches that came from it.
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.myMatches = state.myMatches.filter((m) => String(m.resume) !== String(action.payload));
      });
  },
});

export default matchSlice.reducer;