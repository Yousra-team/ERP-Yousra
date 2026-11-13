import { Router } from "express";
import { archiveEmployee, createEmployee, getAnEmployee, getArchivedEmployee, getEmployees, listArchivedEmployees, restoreEmployee, updateEmployee } from "./employees/employee";
import { addSpouse, endMarriage, getSpouse, listSpouses, updateSpouse } from "./employees/spouses/spouse";
import { addChild, DeleteChildren, getAChild, listChildren, updateChild } from "./employees/children/child";
import { addParent, deleteParent, getParent, getParents, updateParent } from "./employees/parents/parent";
import { addContact, deleteContact, getContact, getContacts, updateContact } from "./employees/contacts/contact";
import { addCredential, deleteCredential, getCredential, getCredentials, updateCredential } from "./employees/credentials/credential";
import { addSkill, deleteSkill, getSkill, getSkills, updateSkill } from "./employees/employee-skills/skills";
import { addPosition, EndPosition, getPosition, getPositions, updatePosition } from "./employees/employee-positions/position";

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

// ALLOW THE API TO BE ACCESSED BY BOTH HR AND EMPLOYEE
// Spouse
router.get("/:matricule/spouses", listSpouses)
router.get("/:matricule/spouses/:spouseMatricule" , getSpouse) // Get Spouse
router.post("/:matricule/spouses", addSpouse) // Add spouse // check for polygamy
router.patch("/:matricule/spouses/:spouseMatricule" , updateSpouse) // Update Spouse
router.post("/:matricule/spouses/:spouseMatricule/end" , endMarriage) // End marriage

// Children
router.get("/:matricule/children", listChildren) // List children
router.get("/:matricule/:childMatricule", getAChild) // Get a child
router.post("/:matricule/children", addChild) // Add a child
router.patch("/:matricule/:childMatricule", updateChild)// Update a child
router.delete("/:matricule/:childMatricule", DeleteChildren)// Delete a child

// Parents
router.get("/:matricule/parents", getParents) // List Parents
router.get("/:matricule/parents/:parentMatricule", getParent) // Get Parent
router.post("/:matricule/parents", addParent) // Add Parent
router.patch("/:matricule/parents/:parentMatricule", updateParent) // Update Parents
router.delete("/:matricule/parents/:parentMatricule", deleteParent) // Delete Parent

//Contacts
router.get("/:matricule/emergency-contacts", getContacts) // get Contacts
router.get("/:matricule/emergency-contacts/:contactId", getContact) // get contact
router.post("/:matricule/emergency-contacts", addContact) // add contact
router.patch("/:matricule/emergency-contacts/:contactId", updateContact) // update contact
router.delete("/:matricule/emergency-contacts/:contactId", deleteContact) // delete contact

// Credentials
router.get("/:matricule/academic-credentials", addCredential) // Get Credentials
router.get("/:matricule/academic-credentials/:id", getCredential) // Get Credential
router.post("/:matricule/academic-credentials", getCredentials) // Add Credential
router.patch("/:matricule/academic-credentials/:id", updateCredential) // Update Credential
router.delete("/:matricule/academic-credentials/:id", deleteCredential) //delete credential

//employee-skills
router.get("/employees/:matricule/skills", getSkills) // get skills
router.get("/employees/:matricule/skills/:skillId", getSkill) // Get skill
router.post("/employees/:matricule/skills", addSkill) // Add a Skill
router.patch("/employees/:matricule/skills/:skillId", updateSkill) //update skill
router.delete("/employees/:matricule/skills/:skillId", deleteSkill) // delete skill

//employee-positions
router.get("/employees/:matricule/positions", getPositions) // get assignments
router.get("/employees/:matricule/position/:assignmentId", getPosition) // Get an assignment
router.post("/employees/:matricule/positions", addPosition) // add assignment
router.patch("/employees/:matricule/positions/:assignmentId", updatePosition) //update assignment
router.post("/employees/:matricule/positions/:assignmentId/end", EndPosition) // End assignment

// You need to fix these API with/employee