const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const treatmentTableName = 'treatment_c';
const procedureLibraryTableName = 'procedure_library_item_c';

export const treatmentService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_c" } },
          { field: { Name: "procedure_c" } },
          { field: { Name: "tooth_c" } },
          { field: { Name: "provider_c" } },
          { field: { Name: "cost_c" } },
          { field: { Name: "insurance_covered_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "status_c" } },
          { 
            field: { Name: "patient_id_c" },
            referenceField: { field: { Name: "Name" } }
          }
        ]
      };

      const response = await apperClient.fetchRecords(treatmentTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(treatment => ({
        Id: treatment.Id,
        patientId: treatment.patient_id_c?.Id?.toString() || treatment.patient_id_c,
        date: treatment.date_c,
        procedure: treatment.procedure_c,
        tooth: treatment.tooth_c ? treatment.tooth_c.split(',') : [],
        provider: treatment.provider_c,
        cost: treatment.cost_c,
        insuranceCovered: treatment.insurance_covered_c,
        notes: treatment.notes_c,
        status: treatment.status_c
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching treatments:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_c" } },
          { field: { Name: "procedure_c" } },
          { field: { Name: "tooth_c" } },
          { field: { Name: "provider_c" } },
          { field: { Name: "cost_c" } },
          { field: { Name: "insurance_covered_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "status_c" } },
          { 
            field: { Name: "patient_id_c" },
            referenceField: { field: { Name: "Name" } }
          }
        ]
      };

      const response = await apperClient.getRecordById(treatmentTableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const treatment = response.data;
      return {
        Id: treatment.Id,
        patientId: treatment.patient_id_c?.Id?.toString() || treatment.patient_id_c,
        date: treatment.date_c,
        procedure: treatment.procedure_c,
        tooth: treatment.tooth_c ? treatment.tooth_c.split(',') : [],
        provider: treatment.provider_c,
        cost: treatment.cost_c,
        insuranceCovered: treatment.insurance_covered_c,
        notes: treatment.notes_c,
        status: treatment.status_c
      };
} catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching treatment with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async getByPatientId(patientId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_c" } },
          { field: { Name: "procedure_c" } },
          { field: { Name: "tooth_c" } },
          { field: { Name: "provider_c" } },
          { field: { Name: "cost_c" } },
          { field: { Name: "insurance_covered_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "patient_id_c" } }
        ],
        where: [
          {
            FieldName: "patient_id_c",
            Operator: "EqualTo",
            Values: [parseInt(patientId)]
          }
        ]
      };

      const response = await apperClient.fetchRecords(treatmentTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(treatment => ({
        Id: treatment.Id,
        patientId: patientId.toString(),
        date: treatment.date_c,
        procedure: treatment.procedure_c,
        tooth: treatment.tooth_c ? treatment.tooth_c.split(',') : [],
        provider: treatment.provider_c,
        cost: treatment.cost_c,
        insuranceCovered: treatment.insurance_covered_c,
        notes: treatment.notes_c,
        status: treatment.status_c
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching treatments by patient ID:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async create(treatmentData) {
    try {
      const params = {
        records: [
          {
            Name: `${treatmentData.procedure} - ${treatmentData.date}`,
            patient_id_c: parseInt(treatmentData.patientId),
            date_c: treatmentData.date || new Date().toISOString().split("T")[0],
            procedure_c: treatmentData.procedure,
            tooth_c: Array.isArray(treatmentData.tooth) ? treatmentData.tooth.join(',') : treatmentData.tooth,
            provider_c: treatmentData.provider,
            cost_c: parseFloat(treatmentData.cost) || 0,
            insurance_covered_c: parseFloat(treatmentData.insuranceCovered) || 0,
            notes_c: treatmentData.notes,
            status_c: treatmentData.status || "completed"
          }
        ]
      };

      const response = await apperClient.createRecord(treatmentTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create treatment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          const treatment = successfulRecord.data;
          return {
            Id: treatment.Id,
            patientId: treatmentData.patientId,
            date: treatment.date_c,
            procedure: treatment.procedure_c,
            tooth: treatment.tooth_c ? treatment.tooth_c.split(',') : [],
            provider: treatment.provider_c,
            cost: treatment.cost_c,
            insuranceCovered: treatment.insurance_covered_c,
            notes: treatment.notes_c,
            status: treatment.status_c
          };
        }
      }
} catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating treatment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async update(id, treatmentData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };
      
      if (treatmentData.patientId) updateData.patient_id_c = parseInt(treatmentData.patientId);
      if (treatmentData.date) updateData.date_c = treatmentData.date;
      if (treatmentData.procedure) updateData.procedure_c = treatmentData.procedure;
      if (treatmentData.tooth) updateData.tooth_c = Array.isArray(treatmentData.tooth) ? treatmentData.tooth.join(',') : treatmentData.tooth;
      if (treatmentData.provider) updateData.provider_c = treatmentData.provider;
      if (treatmentData.cost !== undefined) updateData.cost_c = parseFloat(treatmentData.cost);
      if (treatmentData.insuranceCovered !== undefined) updateData.insurance_covered_c = parseFloat(treatmentData.insuranceCovered);
      if (treatmentData.notes) updateData.notes_c = treatmentData.notes;
      if (treatmentData.status) updateData.status_c = treatmentData.status;
      
      if (treatmentData.procedure && treatmentData.date) {
        updateData.Name = `${treatmentData.procedure} - ${treatmentData.date}`;
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord(treatmentTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update treatment ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulUpdate = response.results.find(result => result.success);
        if (successfulUpdate) {
          const treatment = successfulUpdate.data;
          return {
            Id: treatment.Id,
            patientId: treatment.patient_id_c?.toString(),
            date: treatment.date_c,
            procedure: treatment.procedure_c,
            tooth: treatment.tooth_c ? treatment.tooth_c.split(',') : [],
            provider: treatment.provider_c,
            cost: treatment.cost_c,
            insuranceCovered: treatment.insurance_covered_c,
            notes: treatment.notes_c,
            status: treatment.status_c
          };
        }
      }
} catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating treatment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(treatmentTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete treatment ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

return response.results.some(result => result.success);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting treatment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  },

  async getRecentTreatments(limit = 10) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_c" } },
          { field: { Name: "procedure_c" } },
          { field: { Name: "tooth_c" } },
          { field: { Name: "provider_c" } },
          { field: { Name: "cost_c" } },
          { field: { Name: "insurance_covered_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "patient_id_c" } }
        ],
        orderBy: [
          {
            fieldName: "date_c",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords(treatmentTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(treatment => ({
        Id: treatment.Id,
        patientId: treatment.patient_id_c?.toString(),
        date: treatment.date_c,
        procedure: treatment.procedure_c,
        tooth: treatment.tooth_c ? treatment.tooth_c.split(',') : [],
        provider: treatment.provider_c,
        cost: treatment.cost_c,
        insuranceCovered: treatment.insurance_covered_c,
        notes: treatment.notes_c,
        status: treatment.status_c
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching recent treatments:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getProcedureLibrary() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "cost_c" } },
          { field: { Name: "insurance_rate_c" } },
          { field: { Name: "duration_c" } }
        ]
      };

      const response = await apperClient.fetchRecords(procedureLibraryTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(procedure => ({
        id: procedure.Id.toString(),
        name: procedure.Name,
        category: procedure.category_c,
        description: procedure.description_c,
        cost: procedure.cost_c,
        insuranceRate: procedure.insurance_rate_c,
        duration: procedure.duration_c
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching procedure library:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async searchProcedures(searchTerm, category = null) {
    try {
      const whereConditions = [];
      
      if (searchTerm) {
        whereConditions.push({
          FieldName: "Name",
          Operator: "Contains",
          Values: [searchTerm]
        });
      }
      
      if (category) {
        whereConditions.push({
          FieldName: "category_c",
          Operator: "EqualTo",
          Values: [category]
        });
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "cost_c" } },
          { field: { Name: "insurance_rate_c" } },
          { field: { Name: "duration_c" } }
        ],
        where: whereConditions
      };

      const response = await apperClient.fetchRecords(procedureLibraryTableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(procedure => ({
        id: procedure.Id.toString(),
        name: procedure.Name,
        category: procedure.category_c,
        description: procedure.description_c,
        cost: procedure.cost_c,
        insuranceRate: procedure.insurance_rate_c,
        duration: procedure.duration_c
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching procedures:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }
};