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
	Add,
	ArrowBack,
	Cancel,
	CancelOutlined,
	Chat,
	Clear,
	Close,
	ElectricBolt,
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
	Avatar,
	Button,
	CircularProgress,
	Divider,
	Fab,
	Grid,
	InputAdornment,
	Paper,
	Popover,
	TextField,
	Typography,
} from "@mui/material";
import axios from "axios";
import moment from "moment";
import { MessageList } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import { SnackbarProvider, enqueueSnackbar } from "notistack";

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

	useEffect(() => {
		if (open && active === "message" && loading) {
			getAllPost();
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

	return (
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
											<TextField
												id="input-with-icon-textfield"
												fullWidth
												placeholder="Search"
												size="small"
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
											<Paper
												elevation={0}
												sx={{
													overflow: "auto",
													width: "-webkit-fill-available",
													height: "500px",
													marginBlockStart: "22px",
													marginBlockEnd: "8px",
												}}
											>
												{inboxList.map((el: any) => (
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
									<Grid item xs={12}>
										<Divider />
									</Grid>
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
                              key={ idx}
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
																			<Button fullWidth variant="text" color="error">
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
								</Grid>
							)}
							{/* BATAS--PESAN */}
              {active === "to-do" && <>
                {
                  loadingTask ? (
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
									) : <></>
                }
              </>}
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
					{/* <FloatingMenu
					slideSpeed={500}
					direction={Directions.Left}
					spacing={20}
					isOpen={open}
				>
					<div
						style={{
							backgroundColor: "rgb(255, 255, 255)",
							borderColor: "transparent",
							borderRadius: "14rem",
							width: "86px",
							boxShadow:
								active !== "none"
									? "-12px 0px 0px 0px rgb(0 0 0 / 10%)"
									: "0px 0px 0px 0px rgb(0 0 0 / 10%)",
						}}
					>
						<MainButton
							iconResting={
								active === "message" ? (
									<QuestionAnswerOutlined style={{ color: "#ffffff" }} />
								) : active === "to-do" ? (
									<ListAltOutlined style={{ color: "#ffffff" }} />
								) : (
									<ElectricBolt style={{ color: "#ffffff" }} />
								)
							}
							iconActive={
								active === "message" ? (
									<QuestionAnswerOutlined style={{ color: "#ffffff" }} />
								) : active === "to-do" ? (
									<ListAltOutlined style={{ color: "#ffffff" }} />
								) : (
									<ElectricBolt style={{ color: "#ffffff" }} />
								)
							}
							background={
								active === "message"
									? "#8785ff"
									: active === "to-do"
									? "#f8b76b"
									: "#2f80ed"
							}
							onClick={() => {
								setOpen(!open);
								setActive("none");
							}}
							size={56}
						/>
					</div>
					{active !== "message" ? (
						<ChildButton
							icon={<QuestionAnswerOutlined style={{ color: "#8785ff" }} />}
							background="white"
							size={50}
							onClick={() => {
								setActive("message");
							}}
						/>
					) : (
						<></>
					)}

					{active !== "to-do" ? (
						<ChildButton
							icon={<ListAltOutlined style={{ color: "#f8b76b" }} />}
							background="white"
							size={50}
							onClick={() => {
								setActive("to-do");
							}}
						/>
					) : (
						<></>
					)}
				</FloatingMenu> */}
				</div>
			</Grid>
		</SnackbarProvider>
	);
}
