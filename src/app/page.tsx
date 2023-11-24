"use client";

import {
	ChildButton,
	Directions,
	FloatingMenu,
	MainButton,
} from "react-floating-button-menu";
import Sidebar from "./layout/sidebar";
import TopToolbar from "./layout/toptoolbar";
import {
	AccessTime,
	Add,
	ArrowBack,
	Cancel,
	CancelOutlined,
	Chat,
	CheckBoxOutlined,
	Clear,
	Close,
	Edit,
	EditOutlined,
	ElectricBolt,
	ExpandMore,
	Favorite,
	ListAlt,
	ListAltOutlined,
	MoreHoriz,
	PeopleAltOutlined,
	Person,
	PersonOutline,
	QuestionAnswerOutlined,
	Search,
	Task,
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Avatar,
	Button,
	Checkbox,
	CircularProgress,
	Divider,
	Fab,
	FormControlLabel,
	FormGroup,
	Grid,
	InputAdornment,
	MenuItem,
	Paper,
	Popover,
	Select,
	SelectChangeEvent,
	TextField,
	Typography,
} from "@mui/material";
import axios from "axios";
import moment from "moment";
import { MessageList } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
export default function Home() {
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState("none");

	const [loading, setLoading] = useState(true);
	const [loadingTask, setLoadingTask] = useState(true);

	const [inboxList, setInboxList] = useState<any>([]);

	const fetchData = async (path: string, payload?: any) => {
		try {
			const result = await axios.get("https://dummyapi.io/data/v1/" + path, {
				headers: {
					"app-id": "650e6846c1a14b15ee7bb397",
					Accept: "*/*",
				},
			});

			console.log("RESULT", result.status, result.data);
			if (result.status === 200) {
				return {
					status: result.status,
					data: result.data,
					error: null,
				};
			} else {
				return {
					status: result.status,
					data: null,
					error: "fetch error",
				};
			}
		} catch (error) {
			console.log("CATCH: ", error);
			return {
				status: 500,
				data: null,
				error: error,
			};
		}
	};

	const getAllPost = async () => {
		setLoading(true);

		try {
			const postData = await fetchData("post");

			const mappedData = postData?.data?.data?.map(
				async (data: any, idx: number) => {
					return {
						id: data.id,
						text: data.text,
						crated_at: data.updatedDate,
						comment: await fetchData("post/" + data.id + "/comment"),
					};
				}
			);

			const result = await Promise.all(mappedData);

			const finalData = result
				.map((el: any) => {
					return {
						id: el.id,
						title: el.text,
						crated_at: el.crated_at,
						comment: el.comment?.data?.data,
					};
				})
				.filter((dt: any) => dt.comment.length > 0);
			console.log("MD: ", finalData);

			setInboxList(
				finalData.sort(function (a: any, b: any) {
					return b.comment[0]?.publishDate < a.comment[0]?.publishDate
						? -1
						: b.comment[0]?.publishDate > a.comment[0]?.publishDate
						? 1
						: 0;
				})
			);
		} catch (error) {
			console.log("ERROR");
		}
		setLoading(false);
	};

	const getAllTask = async () => {
		setLoadingTask(true);

		try {
			// const postData = await fetchData("post");
			// const mappedData = postData?.data?.data?.map(
			// 	async (data: any, idx: number) => {
			// 		return {
			// 			id: data.id,
			// 			text: data.text,
			// 			crated_at: data.updatedDate,
			// 			comment: await fetchData("post/" + data.id + "/comment"),
			// 		};
			// 	}
			// );
			// const result = await Promise.all(mappedData);
			// const finalData = result
			// 	.map((el: any) => {
			// 		return {
			// 			id: el.id,
			// 			title: el.text,
			// 			crated_at: el.crated_at,
			// 			comment: el.comment?.data?.data,
			// 		};
			// 	})
			// 	.filter((dt: any) => dt.comment.length > 0);
			// console.log("MD: ", finalData);
			// setInboxList(
			// 	finalData.sort(function (a: any, b: any) {
			// 		return b.comment[0]?.publishDate < a.comment[0]?.publishDate
			// 			? -1
			// 			: b.comment[0]?.publishDate > a.comment[0]?.publishDate
			// 			? 1
			// 			: 0;
			// 	})
			// );
		} catch (error) {
			console.log("ERROR");
		}
		setLoadingTask(false);
	};

	useEffect(() => {
		if (open && active === "message" && loading) {
			getAllPost();
		}
		if (open && active === "to-do" && loadingTask) {
			getAllTask();
		}
	}, [open, active]);

	const [selectedChat, setSelectedChat] = useState<any>([]);
	const messageListReferance = React.createRef();
	const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const openPop = Boolean(anchorEl);
	const id = openPop ? "simple-popover" : undefined;

	const [chat, setChat] = useState("");

	const handleSend = async () => {
		const currChat = selectedChat;
		console.log(1, currChat);
		const newComment = {
			id: "x",
			message: chat,
			owner: {
				id: "650e7678457a7c4b4d1ee5c3",
				firstName: "Dhinta",
				lastName: "Dewa",
			},
			post: "X",
			publishDate: new Date(),
		};

		const currComment = [...currChat.comment];
		currComment.unshift(newComment);
		console.log(2, currComment);
		setSelectedChat({
			...currChat,
			comment: [...currComment],
		});

		axios
			.post(
				"https://dummyapi.io/data/v1/comment/create",
				{
					owner: "650e7678457a7c4b4d1ee5c3",
					post: selectedChat.id,
					message: chat,
				},
				{
					headers: {
						"app-id": "650e6846c1a14b15ee7bb397",
						Accept: "*/*",
					},
				}
			)
			.then((r) => {
				console.log("HEHE", r.data);
				setChat("");
			});
	};

	const colorList = [
		{
			name: "#E5A443",
			buble: "#FCEED3",
		},
		{
			name: "#43B78D",
			buble: "#D2F2E3",
		},
	];
	const [participants, setParticipants] = useState<any>([]);

	useEffect(() => {
		const mapped = selectedChat?.comment?.map((el: any) => {
			return el.owner.id;
		});

		setParticipants((old: any) => [...new Set(mapped)]);

		// console.log("MURKOV");
	}, [selectedChat]);

	useEffect(() => {
		console.log("MURKOV", participants);
	}, [participants]);

	const [taskFilter, setTaskFilter] = useState<string>("");
	const [chatFilter, setChatFilter] = useState<string>("");

	const handleChangeFilter = (event: SelectChangeEvent) => {
		setTaskFilter(event.target.value as string);
	};

	type iTaskType = {
		id: string;
		title: string;
		date: Date;
		description?: string;
		isDone: boolean;
		isExpanded: boolean;
		isEdit: boolean;
		type: string;
	};

	// const taskModel: Array<iTaskType> = [
	// 	{
	// 		date: new Date("2023-01-20"),
	// 		title: "Setup appointment",
	// 		isDone: false,
	// 		type: "urgent",
	// 		description: "Create an appointment with Dr. Blake",
	// 	},
	// 	{
	// 		date: new Date("2023-02-10"),
	// 		title: "Setup PC",
	// 		isDone: false,
	// 		type: "personal-errands",
	// 		description: "Cook some food",
	// 	},
	// ];

	const [taskList, setTaskList] = useState<Array<iTaskType>>([
		{
			id: "0",
			date: new Date("2024-01-20"),
			title: "Setup appointment",
			isDone: true,
			isExpanded: true,
			type: "urgent",
			description: "Create an appointment with Dr. Blake",
			isEdit: false,
		},
		{
			id: "1",
			date: new Date("2024-02-10"),
			title: "Setup PC",
			isDone: false,
			isExpanded: true,
			type: "personal-errands",
			description: "Cook some food",
			isEdit: false,
		},
	]);

	const addTask = (data: any) => {
		let currItem = [...taskList];

		setTaskList([...currItem, data]);
	};

	const updateTask = (id: any, col: string, value: any) => {
		setTaskList((old: any) => {
			let currItem = [...old];
			let selected = currItem.filter((dt: any) => dt?.["id"] === id)?.[0];
			var idx = currItem.indexOf(selected);

			let finalData = {
				...selected,
				[col]: value,
			};
			currItem[idx] = finalData;
			return [...currItem];
		});
	};

	const removeTask = (id: string) => {
		setTaskList((old: any) => {
			let currItem = [...old];

			let selected = currItem.filter((dt: any) => dt?.["id"] === id)?.[0];
			var idx = currItem.indexOf(selected);
			currItem.splice(idx, 1);
			return [...currItem];
		});
	};

	useEffect(() => {
		console.log("UPDATE", taskList);
	}, [taskList]);

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<SnackbarProvider autoHideDuration={3000}>
				<Grid
					container
					display={"flex"}
					style={{
						width: "100%",
					}}
				>
					<Grid container xs={12} display={"flex"} flexDirection={"row"}>
						<Grid item xs={3}>
							<Sidebar />
						</Grid>
						<Grid item xs={9} display={"flex"} flexDirection={"column"}>
							<Grid item xs={12} display={"flex"} flexDirection={"column"} style={{}}>
								<TopToolbar />
							</Grid>
						</Grid>
					</Grid>
					{active !== "none" && (
						<div
							style={{
								position: "absolute",
								bottom: 90,
								right: 15,
								display: "flex",
								flexDirection: "row",
								alignItems: "flex-end",
							}}
						>
							<Paper
								elevation={1}
								style={{
									width: "700px",
									height: "600px",
									paddingBlock: "24px",
									paddingInline: "32px",
								}}
							>
								{active === "message" && (
									<>
										{loading ? (
											<Grid
												container
												display={"flex"}
												flexDirection={"column"}
												justifyContent={"center"}
												alignItems={"center"}
												sx={{ height: "100%" }}
											>
												<CircularProgress />
												<div>Loading Chat</div>
											</Grid>
										) : (
											<div>
												{/* THREAD LIST HEADER */}
												<TextField
													id="dummy-search"
													fullWidth
													placeholder="Search Title"
													size="small"
													value={chatFilter}
													onChange={(evt) => {
														setChatFilter(evt.target.value);
													}}
													style={{ background: "#ffffff", borderRadius: "8px" }}
													InputProps={{
														endAdornment: (
															<InputAdornment position="start">
																<Search />
															</InputAdornment>
														),
													}}
													variant="outlined"
												/>
												{/* THREAD LIST HEADER */}

												{/* THREAD LIST */}
												<Paper
													id={"thread-list-paper"}
													elevation={0}
													sx={{
														overflow: "auto",
														width: "-webkit-fill-available",
														height: "500px",
														marginBlockStart: "22px",
														marginBlockEnd: "8px",
													}}
												>
													{inboxList
														.filter((dt: any) =>
															dt.title.toLowerCase().includes(chatFilter.toLocaleLowerCase())
														)
														.map((el: any) => (
															<Grid
																key={el.id}
																container
																display={"flex"}
																flexDirection={"row"}
																mt={"22px"}
																onClick={() => {
																	setSelectedChat(el);
																	setActive("conversation");
																}}
															>
																<Grid item style={{ position: "relative" }} xs={1.5}>
																	<div
																		style={{
																			position: "absolute",
																			background: "#c4c4c4",
																			color: "#000",
																			borderRadius: "100px",
																			padding: "3px",
																			height: "44px",
																			width: "44px",
																			fontSize: "20px",
																			display: "flex",
																			flexDirection: "row",
																			justifyContent: "center",
																			alignItems: "center",
																		}}
																	>
																		<PersonOutline />
																	</div>
																	<div
																		style={{
																			position: "absolute",
																			marginInlineStart: "20px",
																			background: "#2f80ed",
																			color: "#fff",
																			borderRadius: "100px",
																			padding: "3px",
																			height: "44px",
																			width: "44px",
																			fontSize: "20px",
																			display: "flex",
																			flexDirection: "row",
																			justifyContent: "center",
																			alignItems: "center",
																		}}
																	>
																		<PersonOutline />
																	</div>
																</Grid>
																<Grid item display={"flex"} flexDirection={"column"} xs={10.5}>
																	<Grid item display={"flex"} flexDirection={"row"}>
																		<div
																			style={{
																				color: "#2f80ed",
																				fontWeight: 600,
																				marginInlineEnd: "15px",
																			}}
																		>
																			{el.title}
																		</div>
																		<div style={{ color: "#000", fontWeight: 400 }}>
																			{moment(el.comment[0]?.publishDate ?? el.created_at).format(
																				"MMMM Do YYYY, HH:mm"
																			)}
																		</div>
																	</Grid>
																	<Grid item display={"flex"} flexDirection={"row"}>
																		<div
																			style={{
																				color: "#000",
																				fontWeight: 500,
																				marginInlineEnd: "15px",
																			}}
																		>
																			{el.comment[0]
																				? el.comment[0].owner.firstName +
																				  " " +
																				  el.comment[0].owner.lastName +
																				  " :"
																				: ""}
																		</div>
																	</Grid>

																	<Grid item display={"flex"} flexDirection={"row"}>
																		<div
																			style={{
																				color: "#000",
																				fontWeight: 300,
																				marginInlineEnd: "15px",
																			}}
																		>
																			{el.comment[0] ? el.comment[0].message : ""}
																		</div>
																	</Grid>
																</Grid>
															</Grid>
														))}
												</Paper>
												{/* THREAD LIST */}
											</div>
										)}
									</>
								)}
								{active === "conversation" && (
									<Grid
										container
										display={"flex"}
										flexDirection={"column"}
										justifyContent={"space-between"}
									>
										{/* CONV HEADER */}
										<Grid
											item
											xs={12}
											display={"flex"}
											flexDirection={"row"}
											alignItems={"center"}
											justifyContent={"space-between"}
										>
											<Grid
												item
												xs={12}
												display={"flex"}
												flexDirection={"row"}
												alignItems={"center"}
											>
												<Grid item display={"flex"} flexDirection={"column"}>
													<Button
														size="large"
														sx={{
															borderRadius: "50px",
															width: "60px",
															height: "60px",
															color: "#000",
														}}
														onClick={() => {
															setLoading(true);
															setActive("message");
														}}
													>
														<ArrowBack />
													</Button>
												</Grid>

												<Grid item display={"flex"} flexDirection={"column"}>
													<div
														style={{
															color: "#2f80ed",
															fontWeight: 600,
															marginInlineEnd: "15px",
														}}
													>
														{selectedChat.title}
													</div>
													<div>{participants.length} Participants</div>
												</Grid>
											</Grid>

											<Grid item display={"flex"} flexDirection={"column"}>
												<Button
													size="large"
													sx={{
														borderRadius: "50px",
														width: "60px",
														height: "60px",
														color: "#000",
													}}
													onClick={() => {
														setOpen(false);
														setLoading(true);
														setActive("none");
													}}
												>
													<Clear />
												</Button>
											</Grid>
										</Grid>
										{/* CONV HEADER */}

										<Grid item xs={12}>
											<Divider />
										</Grid>

										{/* CONV ITEM */}
										<Grid item xs={12}>
											<div
												id="scrollableDiv"
												style={{
													height: "410px",
													width: "100%",
													overflow: "auto",
													display: "flex",
													flexDirection: "column-reverse",
												}}
											>
												{selectedChat.comment
													.sort(function (a: any, b: any) {
														return b.publishDate < a.publishDate
															? -1
															: b.publishDate > a.publishDate
															? 1
															: 0;
													})
													.map((el: any) => {
														return {
															position:
																el.owner?.id === "650e7678457a7c4b4d1ee5c3" ? "right" : "left",
															type: "text",
															text: el.message,
															date: el.publishDate,
															owner: el.owner,
														};
													})
													.map((dt: any, idx: number, arr: Array<any>) => {
														return (
															<div
																key={idx}
																style={{
																	display: "flex",
																	flexDirection: "column",
																	alignItems:
																		dt.owner?.id === "650e7678457a7c4b4d1ee5c3"
																			? "flex-end"
																			: "flex-start",
																}}
															>
																{idx === arr.length - 1 && (
																	<div style={{ width: "100%" }}>
																		<Divider>
																			{moment(Date.now()).format("MMMM DD, YYYY") ===
																				moment(dt.date).format("MMMM DD, YYYY") && "Today"}{" "}
																			{moment(dt.date).format("MMMM DD, YYYY")}
																		</Divider>
																	</div>
																)}
																{idx + 1 <= arr.length - 1 &&
																	moment(arr[idx + 1].date).format("MMMM DD, YYYY") !==
																		moment(dt.date).format("MMMM DD, YYYY") && (
																		<div style={{ width: "100%" }}>
																			<Divider>
																				{moment(Date.now()).format("MMMM DD, YYYY") ===
																					moment(dt.date).format("MMMM DD, YYYY") && "Today"}{" "}
																				{moment(dt.date).format("MMMM DD, YYYY")}
																			</Divider>
																		</div>
																	)}

																{dt.owner?.id === "650e7678457a7c4b4d1ee5c3"
																	? "You"
																	: dt.owner.firstName + " " + dt.owner.lastName}
																<div
																	style={{
																		display: "flex",
																		flexDirection: "row",
																		width: "fit-content",
																		maxWidth: "50%",
																	}}
																>
																	{dt.owner?.id === "650e7678457a7c4b4d1ee5c3" && (
																		<Button
																			size="large"
																			sx={{
																				borderRadius: "50px",
																				width: "15px",
																				minWidth: "0px",
																				height: "30px",
																				color: "#000",
																			}}
																			onClick={handleClick}
																		>
																			<MoreHoriz />
																		</Button>
																	)}
																	<div
																		style={{
																			padding: "8px",
																			marginBlock: "5px",
																			marginInlineEnd: "5px",
																			borderRadius: "8px",
																			background:
																				colorList[
																					participants.findIndex(
																						(element: string) => element === dt.owner?.id
																					) %
																						2 ===
																					0
																						? 0
																						: 1
																				].buble,
																			display: "flex",
																			// width: "fit-content",
																			// maxWidth: "50%",
																			flexDirection: "column",
																		}}
																	>
																		<div>{dt.text}</div>
																		<div
																			style={{
																				fontSize: "12px",
																				textAlign:
																					dt.owner?.id !== "650e7678457a7c4b4d1ee5c3"
																						? "right"
																						: "left",
																			}}
																		>
																			{moment(dt.date).format("HH:mm")}
																		</div>
																	</div>
																	{dt.owner?.id !== "650e7678457a7c4b4d1ee5c3" && (
																		<Button
																			size="large"
																			sx={{
																				borderRadius: "50px",
																				width: "15px",
																				minWidth: "0px",
																				height: "30px",
																				color: "#000",
																			}}
																			onClick={() => {
																				enqueueSnackbar("Not yet implemented", {
																					variant: "warning",
																					autoHideDuration: 3000,
																				});
																			}}
																		>
																			<MoreHoriz />
																		</Button>
																	)}
																	<Popover
																		id={id}
																		open={openPop}
																		anchorEl={anchorEl}
																		onClose={handleClose}
																		anchorOrigin={{
																			vertical: "bottom",
																			horizontal: "left",
																		}}
																	>
																		<Grid container display={"flex"} flexDirection={"column"}>
																			<Grid item>
																				<Button
																					fullWidth
																					variant="text"
																					color="primary"
																					onClick={() => {
																						enqueueSnackbar("Not yet implemented", {
																							variant: "warning",
																							autoHideDuration: 3000,
																						});
																					}}
																				>
																					Edit
																				</Button>
																			</Grid>
																			<Divider />
																			<Grid item>
																				<Button
																					fullWidth
																					variant="text"
																					color="error"
																					onClick={() => {
																						enqueueSnackbar("Not yet implemented", {
																							variant: "warning",
																							autoHideDuration: 3000,
																						});
																					}}
																				>
																					Delete
																				</Button>
																			</Grid>
																		</Grid>
																	</Popover>
																</div>
															</div>
														);
													})}
											</div>
										</Grid>
										{/* CONV ITEM */}

										{/* CONV FOOTER */}
										<Grid
											item
											xs={12}
											mt={"15px"}
											display={"flex"}
											flexDirection={"row"}
											// justifyContent={"center"}
											alignItems={"center"}
											gap={1}
										>
											<Grid item xs={10.5}>
												<TextField
													id="input-with-icon-textfield"
													fullWidth
													size="small"
													placeholder="Type a new message"
													style={{
														background: "#ffffff",
														borderRadius: "8px",
														height: "40px",
													}}
													value={chat}
													onChange={(evt) => setChat(evt.target.value)}
													variant="outlined"
												/>
											</Grid>
											<Grid item xs={1.5}>
												<Button
													id={"send-button"}
													variant="contained"
													// size="large"
													fullWidth
													style={{
														textTransform: "none",
														background: "#2f80ed",
														height: "40px",
													}}
													onClick={() => {
														handleSend();
													}}
												>
													Send
												</Button>
											</Grid>
										</Grid>
										{/* CONV FOOTER */}
									</Grid>
								)}
								{/* BATAS--PESAN */}
								{active === "to-do" && (
									<>
										{loadingTask ? (
											<Grid
												container
												display={"flex"}
												flexDirection={"column"}
												justifyContent={"center"}
												alignItems={"center"}
												sx={{ height: "100%" }}
											>
												<CircularProgress />
												<div>Loading Task</div>
											</Grid>
										) : (
											<div>
												{/* TASK LIST HEADER */}
												<Grid
													container
													display={"flex"}
													flexDirection={"row"}
													justifyContent={"space-between"}
												>
													<Grid item xs={4}>
														<Select
															labelId="task-filter-select"
															id="task-filter-select"
															fullWidth
															size="small"
															value={taskFilter}
															variant="outlined"
															sx={{ borderRadius: "8px" }}
															onChange={handleChangeFilter}
														>
															<MenuItem value={""}>All</MenuItem>
															<MenuItem value={"personal-errands"}>Personal Errands</MenuItem>
															<MenuItem value={"urgent"}>Urgent To-Do</MenuItem>
														</Select>
													</Grid>
													<Grid item xs={2}>
														<Button
															id={"send-button"}
															variant="contained"
															fullWidth
															style={{
																textTransform: "none",
																background: "#2f80ed",
																borderRadius: "8px",
																height: "40px",
															}}
															onClick={() => {
																enqueueSnackbar("Not yet implemented", {
																	variant: "warning",
																	autoHideDuration: 3000,
																});
															}}
														>
															New Task
														</Button>
													</Grid>
												</Grid>
												{/* TASK LIST HEADER */}

												{/* TASK LIST */}
												<Paper
													id={"task-list-paper"}
													elevation={0}
													sx={{
														overflow: "auto",
														width: "-webkit-fill-available",
														height: "500px",
														marginBlockStart: "22px",
														marginBlockEnd: "8px",
													}}
												>
													{taskList
														.filter((dt: iTaskType) =>
															taskFilter ? dt.type === taskFilter : true
														)
														.map((task: iTaskType) => {
															return (
																<Accordion
																	key={task.id}
																	expanded={task.isExpanded}
																	sx={{ borderRadius: "8px", background: "transparent" }}
																	elevation={1}
																>
																	<AccordionSummary
																		sx={{
																			// pointerEvents: "none",
																			color: "#000000",
																			borderRadius: "8px",
																		}}
																		expandIcon={
																			<Grid container display={"flex"} flexDirection={"row"}>
																				{task.isExpanded && (
																					<Button
																						size="large"
																						sx={{
																							borderRadius: "50px",
																							width: "15px",
																							minWidth: "0px",
																							height: "30px",
																							color: "#000",
																							marginInlineStart: "15px",
																						}}
																						onClick={handleClick}
																					>
																						<MoreHoriz />
																					</Button>
																				)}

																				<Popover
																					id={id}
																					open={openPop}
																					anchorEl={anchorEl}
																					onClose={handleClose}
																					anchorOrigin={{
																						vertical: "bottom",
																						horizontal: "left",
																					}}
																				>
																					<Grid container display={"flex"} flexDirection={"column"}>
																						<Grid item>
																							<Button
																								fullWidth
																								variant="text"
																								color="error"
																								onClick={() => {
																									setAnchorEl(null);
																									removeTask(task.id);
																								}}
																							>
																								Delete
																							</Button>
																						</Grid>
																					</Grid>
																				</Popover>
																				<ExpandMore
																					sx={{
																						pointerEvents: "auto",
																						marginInlineEnd: task.isExpanded ? "0px" : "15px",
																						marginInlineStart: task.isExpanded ? "15px" : "0px",
																						color: "#000000",
																					}}
																					onClick={() => {
																						updateTask(task.id, "isExpanded", !task.isExpanded);
																					}}
																				/>
																				{!task.isExpanded && (
																					<Button
																						size="large"
																						sx={{
																							borderRadius: "50px",
																							width: "15px",
																							minWidth: "0px",
																							height: "30px",
																							color: "#000",
																							marginInlineEnd: "15px",
																						}}
																						onClick={handleClick}
																					>
																						<MoreHoriz />
																					</Button>
																				)}
																			</Grid>
																		}
																		aria-controls="panel1a-content"
																		id="panel1a-header"
																	>
																		<Grid container display={"flex"} flexDirection={"row"}>
																			<Grid item xs={1.5}>
																				<Button
																					size="large"
																					sx={{
																						borderRadius: "50px",
																						width: "60px",
																						height: "60px",
																						color: "#000",
																					}}
																					onClick={(evt) => {
																						updateTask(task.id, "isDone", !task.isDone);
																					}}
																				>
																					{task.isDone ? <Checkbox /> : <CheckBoxOutlined />}
																				</Button>
																			</Grid>
																			<Grid
																				item
																				xs={6.5}
																				display={"flex"}
																				flexDirection={"row"}
																				alignItems={"center"}
																			>
																				<Typography
																					sx={{
																						fontSize: "0.85rem",
																						fontWeight: "700",
																						color: "#000000",
																						textDecoration: !task.isDone ? "line-through" : "none",
																					}}
																				>
																					{task.title}
																				</Typography>
																			</Grid>
																			<Grid
																				item
																				xs={4}
																				display={"flex"}
																				flexDirection={"row"}
																				alignItems={"center"}
																				justifyContent={"flex-end"}
																			>
																				<div style={{ color: "#eb5757", marginInlineEnd: "5px" }}>
																					{task.isDone &&
																						moment(task.date).diff(moment(), "days") +
																							"day left"}{" "}
																				</div>{" "}
																				{moment(task.date).format("DD/MM/YYYY")}
																			</Grid>
																		</Grid>
																	</AccordionSummary>
																	<AccordionDetails
																		sx={{ borderRadius: "8px", background: "#ffffff" }}
																	>
																		<Grid
																			container
																			display={"flex"}
																			flexDirection={"column"}
																			gap={1}
																		>
																			<Grid
																				item
																				display={"flex"}
																				flexDirection={"row"}
																				alignItems={"center"}
																				gap={2}
																			>
																				<AccessTime
																					height={"40px"}
																					width={"40px"}
																					sx={{ color: "#2f80ed" }}
																				/>{" "}
																				<DatePicker
																					label="Controlled picker"
																					value={dayjs(task.date)}
																					onChange={(newValue) =>
																						updateTask(task.id, "date", newValue?.toDate())
																					}
																				/>
																			</Grid>
																			<Grid
																				item
																				display={"flex"}
																				flexDirection={"row"}
																				alignItems={"center"}
																				gap={2}
																			>
																				<EditOutlined
																					height={"40px"}
																					width={"40px"}
																					sx={{ color: "#2f80ed" }}
																					onClick={() => {
																						updateTask(task.id, "isEdit", !task.isEdit);
																					}}
																				/>{" "}
																				<TextField
																					fullWidth
																					value={task.description}
																					sx={{ border: "none" }}
																					disabled={!task.isEdit}
																					onChange={(evt: any) => {
																						updateTask(task.id, "description", evt.target.value);
																					}}
																					variant={task.isEdit ? "outlined" : "standard"}
																					InputProps={{
																						disableUnderline: task.isEdit ? false : true,
																					}}
																				/>
																			</Grid>
																		</Grid>
																	</AccordionDetails>
																</Accordion>
															);
														})}
												</Paper>
												{/* TASK LIST */}
											</div>
										)}
									</>
								)}
							</Paper>
						</div>
					)}
					<div
						style={{
							position: "absolute",
							bottom: 15,
							right: 15,
							display: "flex",
							flexDirection: "row",
							alignItems: "flex-end",
						}}
					>
						{open && active !== "to-do" && (
							<Grid
								container
								display={"flex"}
								flexDirection={"column"}
								justifyContent={"center"}
								alignItems={"center"}
								marginInline={"5px"}
							>
								<span style={{ color: active === "none" ? "" : "transparent" }}>
									Task
								</span>
								<div
									style={{
										backgroundColor: "rgb(255, 255, 255)",
										borderColor: "transparent",
										borderRadius: "14rem",
										width: "56px",
									}}
								>
									<Fab
										color="primary"
										style={{ background: "#ffffff" }}
										aria-label="add"
										onClick={() => {
											setActive("to-do");
										}}
									>
										<ListAltOutlined style={{ color: "#f8b76b" }} />
									</Fab>
								</div>
							</Grid>
						)}

						{open && active !== "message" && active !== "conversation" && (
							<Grid
								container
								display={"flex"}
								flexDirection={"column"}
								justifyContent={"center"}
								alignItems={"center"}
								marginInline={"5px"}
							>
								<span style={{ color: active === "none" ? "" : "transparent" }}>
									Inbox
								</span>
								<div
									style={{
										backgroundColor: "rgb(255, 255, 255)",
										borderColor: "transparent",
										borderRadius: "14rem",
										width: "56px",
									}}
								>
									<Fab
										color="primary"
										style={{ background: "#ffffff" }}
										aria-label="add"
										onClick={() => {
											setActive("message");
										}}
									>
										<QuestionAnswerOutlined style={{ color: "#8785ff" }} />
									</Fab>
								</div>
							</Grid>
						)}
						{/* MAIN BUTTON */}
						<Grid
							container
							display={"flex"}
							flexDirection={"column"}
							justifyContent={"center"}
							alignItems={"flex-end"}
							marginInline={"5px"}
						>
							<span style={{ color: "transparent", cursor: "default" }}>_____</span>
							<div
								style={{
									backgroundColor: "rgb(255, 255, 255)",
									borderColor: "transparent",
									borderRadius: "14rem",
									width: "56px",
									boxShadow:
										active !== "none"
											? "-12px 0px 0px 0px rgb(0 0 0 / 10%)"
											: "0px 0px 0px 0px rgb(0 0 0 / 10%)",
								}}
							>
								<Fab
									color="primary"
									style={{
										background:
											active === "message"
												? "#8785ff"
												: active === "to-do"
												? "#f8b76b"
												: "#2f80ed",
									}}
									aria-label="add"
									onClick={() => {
										if (!open === false) {
											setLoading(true);
											setLoadingTask(true);
										}
										setOpen(!open);
										setActive("none");
									}}
								>
									{active === "message" ? (
										<QuestionAnswerOutlined style={{ color: "#ffffff" }} />
									) : active === "to-do" ? (
										<ListAltOutlined style={{ color: "#ffffff" }} />
									) : (
										<ElectricBolt style={{ color: "#ffffff" }} />
									)}
								</Fab>
							</div>
						</Grid>
						{/* MAIN BUTTON */}
					</div>
				</Grid>
			</SnackbarProvider>
		</LocalizationProvider>
	);
}
