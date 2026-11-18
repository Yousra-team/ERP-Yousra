import { Router } from "express";
import { archiveEmployee, createEmployee, getAnEmployee, getArchivedEmployee, getEmployees, listArchivedEmployees, restoreEmployee, updateEmployee } from "./employee";
import { addSpouse, endMarriage, getSpouse, listSpouses, updateSpouse } from "./spouses/spouse";
import { addChild, deleteChild, getAChild, listChildren, updateChild } from "./children/child";
import { addParent, deleteParent, getParent, getParents, updateParent } from "./parents/parent";
import { addContact, deleteContact, getContact, getContacts, updateContact } from "./contacts/contact";
import { addCredential, deleteCredential, getCredential, getCredentials, updateCredential } from "./credentials/credential";
import { addSkill, deleteSkill, getSkill, getSkills, updateSkill } from "./employee-skills/skills";
import { addPosition, EndPosition, getPosition, getPositions, updatePosition } from "./employee-positions/position";
import { createContract, getContract, listContracts, terminateContract, updateContract } from "./employee-contract/contract";
import { requireRole } from "../../../lib/auth.middleware";

// mounted at /api/v1/hr/employees by hrRouter
// reads are open to any logged in user, writes are HR only

const router = Router()

//Employee
router.post("/" , requireRole(["HR"]), createEmployee)
router.post("/:matricule/archive", requireRole(["HR"]), archiveEmployee )
router.post("/:matricule/restore", requireRole(["HR"]), restoreEmployee)
router.get("/archived" , listArchivedEmployees) // must stay above /:matricule
router.get("/archived/:matricule" , getArchivedEmployee)
router.patch("/:matricule", requireRole(["HR"]), updateEmployee)
router.get("/" , getEmployees)
router.get("/:matricule", getAnEmployee)

// ALLOW THE API TO BE ACCESSED BY BOTH HR AND EMPLOYEE
// Spouse
router.get("/:matricule/spouses", listSpouses)
router.get("/:matricule/spouses/:spouseMatricule" , getSpouse) // Get Spouse
router.post("/:matricule/spouses", requireRole(["HR"]), addSpouse) // Add spouse // check for polygamy
router.patch("/:matricule/spouses/:spouseMatricule" , requireRole(["HR"]), updateSpouse) // Update Spouse
router.post("/:matricule/spouses/:spouseMatricule/end" , requireRole(["HR"]), endMarriage) // End marriage

// Children
router.get("/:matricule/children", listChildren) // List children
router.get("/:matricule/children/:childMatricule", getAChild) // Get a child
router.post("/:matricule/children", requireRole(["HR"]), addChild) // Add a child
router.patch("/:matricule/children/:childMatricule", requireRole(["HR"]), updateChild)// Update a child
router.delete("/:matricule/children/:childMatricule", requireRole(["HR"]), deleteChild)// Delete a child

// Parents
router.get("/:matricule/parents", getParents) // List Parents
router.get("/:matricule/parents/:parentMatricule", getParent) // Get Parent
router.post("/:matricule/parents", requireRole(["HR"]), addParent) // Add Parent
router.patch("/:matricule/parents/:parentMatricule", requireRole(["HR"]), updateParent) // Update Parents
router.delete("/:matricule/parents/:parentMatricule", requireRole(["HR"]), deleteParent) // Delete Parent

//Contacts
router.get("/:matricule/emergency-contacts", getContacts) // get Contacts
router.get("/:matricule/emergency-contacts/:contactId", getContact) // get contact
router.post("/:matricule/emergency-contacts", requireRole(["HR"]), addContact) // add contact
router.patch("/:matricule/emergency-contacts/:contactId", requireRole(["HR"]), updateContact) // update contact
router.delete("/:matricule/emergency-contacts/:contactId", requireRole(["HR"]), deleteContact) // delete contact

// Credentials
router.get("/:matricule/academic-credentials", getCredentials) // Get Credentials
router.get("/:matricule/academic-credentials/:id", getCredential) // Get Credential
router.post("/:matricule/academic-credentials", requireRole(["HR"]), addCredential) // Add Credential
router.patch("/:matricule/academic-credentials/:id", requireRole(["HR"]), updateCredential) // Update Credential
router.delete("/:matricule/academic-credentials/:id", requireRole(["HR"]), deleteCredential) //delete credential

//employee-skills
router.get("/:matricule/skills", getSkills) // get skills
router.get("/:matricule/skills/:skillId", getSkill) // Get skill
router.post("/:matricule/skills", requireRole(["HR"]), addSkill) // Add a Skill
router.patch("/:matricule/skills/:skillId", requireRole(["HR"]), updateSkill) //update skill
router.delete("/:matricule/skills/:skillId", requireRole(["HR"]), deleteSkill) // delete skill

//employee-positions
router.get("/:matricule/positions", getPositions) // get assignments
router.get("/:matricule/positions/:assignmentId", getPosition) // Get an assignment
router.post("/:matricule/positions", requireRole(["HR"]), addPosition) // add assignment
router.patch("/:matricule/positions/:assignmentId", requireRole(["HR"]), updatePosition) //update assignment
router.post("/:matricule/positions/:assignmentId/end", requireRole(["HR"]), EndPosition) // End assignment

// Contracts
router.get("/:matricule/contracts", listContracts) // get contracts
router.get("/:matricule/contracts/:contractId", getContract) // Get a contract
router.post("/:matricule/contracts", requireRole(["HR"]), createContract) // add contract
router.patch("/:matricule/contracts/:contractId", requireRole(["HR"]), updateContract) //update contract
router.post("/:matricule/contracts/:contractId/terminate", requireRole(["HR"]), terminateContract) // terminate contract

export default router
