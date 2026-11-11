import { Router } from "express";
import { archiveEmployee, createEmployee, getAnEmployee, getArchivedEmployee, getEmployees, listArchivedEmployees, restoreEmployee, updateEmployee } from "./employee";
import { addSpouse, endMarriage, getSpouse, listSpouses, updateSpouse } from "./spouses/spouse";
import { addChild, DeleteChildren, getAChild, listChildren, updateChild } from "./children/child";
import { addParent, deleteParent, getParent, getParents, updateParent } from "./parents/parent";
import { addContact, deleteContact, getContact, getContacts, updateContact } from "./contacts/contact";

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
router.get("/:matricule/academic-credentials",) // Get Credentials
router.get("/:matricule/academic-credentials/:id") // Get Credential
router.post("/:matricule/academic-credentials",) // Add Credential
router.patch("/:matricule/academic-credentials/:id") // Update Credential
router.delete("/:matricule/academic-credentials/:id") // Get Credential
