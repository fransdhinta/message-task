import { Search, SearchOffOutlined } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";
import React from "react";

function TopToolbar(props: any) {
	return (
		<div className="p-5" style={{ background: "#f8b76b" }}>
			<TextField
				id="input-with-icon-textfield"
				fullWidth
				style={{ background: "#ffffff", borderRadius: "8px" }}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<Search />
						</InputAdornment>
					),
				}}
				variant="outlined"
			/>
		</div>
	);
}

export default TopToolbar;
