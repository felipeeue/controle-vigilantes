const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");

// Inicializa Admin SDK com conta de serviço
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 🔹 Criar usuário (apenas admin)
app.post("/create-user", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const userRecord = await auth.createUser({ email, password });
    await db.collection("users").doc(userRecord.uid).set({ role });
    res.json({ success: true, uid: userRecord.uid, role });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 🔹 Listar vigilantes
app.get("/vigilantes", async (req, res) => {
  const snapshot = await db.collection("vigilantes").get();
  const vigilantes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(vigilantes);
});

// 🔹 Adicionar vigilante
app.post("/vigilantes", async (req, res) => {
  const { nome, funcao, turno } = req.body;
  try {
    const docRef = await db.collection("vigilantes").add({ nome, funcao, turno });
    res.json({ id: docRef.id, nome, funcao, turno });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🔹 Editar vigilante
app.put("/vigilantes/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, funcao, turno } = req.body;
  try {
    await db.collection("vigilantes").doc(id).update({ nome, funcao, turno });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🔹 Excluir vigilante
app.delete("/vigilantes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection("vigilantes").doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
