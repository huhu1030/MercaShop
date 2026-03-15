import { createSlice } from '@reduxjs/toolkit';

interface GeneralSettingsState {
  isSoundEnabled: boolean;
}

const initialState: GeneralSettingsState = { isSoundEnabled: false };

export const generalSettingsSlice = createSlice({
  name: 'generalSettings',
  initialState,
  reducers: {
    enableNotification: (state) => { state.isSoundEnabled = true; },
    disableNotification: (state) => { state.isSoundEnabled = false; },
  },
});

export const { enableNotification, disableNotification } = generalSettingsSlice.actions;
export default generalSettingsSlice.reducer;
