// ---------------------------
// START SERVER
// ---------------------------
// Render will give PORT in process.env.PORT
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
