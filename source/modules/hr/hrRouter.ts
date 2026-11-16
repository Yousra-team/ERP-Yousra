import { Router } from "express";
import { archiveEmployee, createEmployee, getAnEmployee, getArchivedEmployee, getEmployees, listArchivedEmployees, restoreEmployee, updateEmployee } from "./employees/employee";
import { addSpouse, endMarriage, getSpouse, listSpouses, updateSpouse } from "./employees/spouses/spouse";
import { addChild, deleteChild, getAChild, listChildren, updateChild } from "./employees/children/child";
import { addParent, deleteParent, getParent, getParents, updateParent } from "./employees/parents/parent";
import { addContact, deleteContact, getContact, getContacts, updateContact } from "./employees/contacts/contact";
import { addCredential, deleteCredential, getCredential, getCredentials, updateCredential } from "./employees/credentials/credential";
import { addSkill, deleteSkill, getSkill, getSkills, updateSkill } from "./employees/employee-skills/skills";
import { addPosition, EndPosition, getPosition, getPositions, updatePosition } from "./employees/employee-positions/position";
import { createContract, getContract, listContracts, terminateContract, updateContract } from "./employees/employee-contract/contract";

// This router is mounted at /api/v1/hr/employees, so "/" here is already the employees collection

const router = Router()

//Employee
router.post("/" , createEmployee)
router.post("/:matricule/archive", archiveEmployee )
router.post("/:matricule/restore", restoreEmployee)
router.get("/archived" , listArchivedEmployees)
router.get("/archived/:matricule" , getArchivedEmployee)
router.patch("/:matricule", updateEmployee)
router.get("/" , getEmployees)
router.get("/:matricule", getAnEmployee)

// ALLOW THE API TO BE ACCESSED BY BOTH HR AND EMPLOYEE
// Spouse
router.get("/:matricule/spouses", listSpouses)
router.get("/:matricule/spouses/:spouseMatricule" , getSpouse) // Get Spouse
router.post("/:matricule/spouses", addSpouse) // Add spouse // check for polygamy
router.patch("/:matricule/spouses/:spouseMatricule" , updateSpouse) // Update Spouse
router.post("/:matricule/spouses/:spouseMatricule/end" , endMarriage) // End marriage

// Children
router.get("/:matricule/children", listChildren) // List children
router.get("/:matricule/children/:childMatricule", getAChild) // Get a child
router.post("/:matricule/children", addChild) // Add a child
router.patch("/:matricule/children/:childMatricule", updateChild)// Update a child
router.delete("/:matricule/children/:childMatricule", deleteChild)// Delete a child

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
router.get("/:matricule/academic-credentials", getCredentials) // Get Credentials
router.get("/:matricule/academic-credentials/:id", getCredential) // Get Credential
router.post("/:matricule/academic-credentials", addCredential) // Add Credential
router.patch("/:matricule/academic-credentials/:id", updateCredential) // Update Credential
router.delete("/:matricule/academic-credentials/:id", deleteCredential) //delete credential

//employee-skills
router.get("/:matricule/skills", getSkills) // get skills
router.get("/:matricule/skills/:skillId", getSkill) // Get skill
router.post("/:matricule/skills", addSkill) // Add a Skill
router.patch("/:matricule/skills/:skillId", updateSkill) //update skill
router.delete("/:matricule/skills/:skillId", deleteSkill) // delete skill

//employee-positions
router.get("/:matricule/positions", getPositions) // get assignments
router.get("/:matricule/positions/:assignmentId", getPosition) // Get an assignment
router.post("/:matricule/positions", addPosition) // add assignment
router.patch("/:matricule/positions/:assignmentId", updatePosition) //update assignment
router.post("/:matricule/positions/:assignmentId/end", EndPosition) // End assignment

//employee-contracts
router.get("/:matricule/contracts", listContracts) // get contracts
router.get("/:matricule/contracts/:contractId", getContract) // Get a contract
router.post("/:matricule/contracts", createContract) // add contract
router.patch("/:matricule/contracts/:contractId", updateContract) //update contract
router.post("/:matricule/contracts/:contractId/terminate", terminateContract) // Terminate contract

export default router
