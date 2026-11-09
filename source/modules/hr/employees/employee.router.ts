import { Router } from "express";
import { archiveEmployee, createEmployee, getAnEmployee, getArchivedEmployee, getEmployees, listArchivedEmployees, restoreEmployee, updateEmployee } from "./employee";
import { addSpouse, getSpouse, listSpouses } from "./spouses/spouse";

const router = Router()

//Employee
router.post("/" , createEmployee)
router.post("/:matricule/archive", archiveEmployee )
router.post("/:matricule/restore", restoreEmployee)
router.get("/archived" , listArchivedEmployees)
router.get("/archived/:matricule" , getArchivedEmployee)
router.patch("/:matricule", updateEmployee)
router.get("/" , getEmployees)
router.get("/matricule", getAnEmployee)

// Spouse
router.get("/:matricule/spouses", listSpouses)
router.get("/:matricule/spouses/:spouseMatricule" , getSpouse) // Get Spouse
router.post("/:matricule/spouses", addSpouse) // Add spouse // check for polygamy
router.patch("/:matricule/spouses/:spouseMatricule") // Update Spouse
router.post("/:matricule/spouses/:spouseMatricule/end") // End marriage
