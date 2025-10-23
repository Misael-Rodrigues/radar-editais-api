from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
import datetime

from database import SessionLocal, engine
import models, crud, utils

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Radar de Editais API", version="1.0")

# Permite chamadas do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # depois você pode restringir ao domínio real
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def raiz():
    return {"status": "API ativa", "timestamp": datetime.datetime.now().isoformat()}

@app.get("/api/editais")
def listar_editais(db: Session = Depends(get_db)):
    editais = crud.get_editais(db)
    return editais

@app.post("/api/editais/coletar")
def coletar_editais(db: Session = Depends(get_db)):
    novos = utils.buscar_editais_pncp()
    crud.salvar_editais(db, novos)
    return {"message": f"{len(novos)} editais coletados com sucesso"}

# Agendador (executa diariamente às 8h)
scheduler = BackgroundScheduler()

@scheduler.scheduled_job("cron", hour=8, minute=0)
def coleta_diaria():
    db = SessionLocal()
    novos = utils.buscar_editais_pncp()
    crud.salvar_editais(db, novos)
    db.close()
    print(f"[{datetime.datetime.now()}] Coleta diária: {len(novos)} editais")

scheduler.start()
print("Agendador iniciado")