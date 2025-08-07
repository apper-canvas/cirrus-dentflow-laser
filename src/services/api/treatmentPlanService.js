const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'treatment_plan_c';

export const treatmentPlanService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "status_c" } },
          { field: { Name: "total_cost_c" } },
          { field: { Name: "total_insurance_covered_c" } },
          { field: { Name: "patient_portion_c" } },
          { 
            field: { Name: "patient_id_c" },
            referenceField: { field: { Name: "Name" } }
          }
        ]
      };

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(plan => ({
        Id: plan.Id,
        name: plan.Name,
        patientId: plan.patient_id_c?.Id?.toString() || plan.patient_id_c,
        status: plan.status_c,
        totalCost: plan.total_cost_c,
        totalInsuranceCovered: plan.total_insurance_covered_c,
        patientPortion: plan.patient_portion_c,
        procedures: [] // Note: procedures would be fetched separately if needed
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching treatment plans:", error?.response?.data?.message);
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
          { field: { Name: "status_c" } },
          { field: { Name: "total_cost_c" } },
          { field: { Name: "total_insurance_covered_c" } },
          { field: { Name: "patient_portion_c" } },
          { 
            field: { Name: "patient_id_c" },
            referenceField: { field: { Name: "Name" } }
          }
        ]
      };

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const plan = response.data;
      return {
        Id: plan.Id,
        name: plan.Name,
        patientId: plan.patient_id_c?.Id?.toString() || plan.patient_id_c,
        status: plan.status_c,
        totalCost: plan.total_cost_c,
        totalInsuranceCovered: plan.total_insurance_covered_c,
        patientPortion: plan.patient_portion_c,
        procedures: [] // Note: procedures would be fetched separately if needed
      };
} catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching treatment plan with ID ${id}:`, error?.response?.data?.message);
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
          { field: { Name: "status_c" } },
          { field: { Name: "total_cost_c" } },
          { field: { Name: "total_insurance_covered_c" } },
          { field: { Name: "patient_portion_c" } },
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

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(plan => ({
        Id: plan.Id,
        name: plan.Name,
        patientId: patientId.toString(),
        status: plan.status_c,
        totalCost: plan.total_cost_c,
        totalInsuranceCovered: plan.total_insurance_covered_c,
        patientPortion: plan.patient_portion_c,
        procedures: []
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching treatment plans by patient ID:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async create(planData) {
    try {
      const params = {
        records: [
          {
            Name: planData.name,
            patient_id_c: parseInt(planData.patientId),
            status_c: planData.status || "draft",
            total_cost_c: parseFloat(planData.totalCost) || 0,
            total_insurance_covered_c: parseFloat(planData.totalInsuranceCovered) || 0,
            patient_portion_c: parseFloat(planData.patientPortion) || 0
          }
        ]
      };

      const response = await apperClient.createRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create treatment plan ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          const plan = successfulRecord.data;
          return {
            Id: plan.Id,
            name: plan.Name,
            patientId: planData.patientId,
            status: plan.status_c,
            totalCost: plan.total_cost_c,
            totalInsuranceCovered: plan.total_insurance_covered_c,
            patientPortion: plan.patient_portion_c,
            procedures: planData.procedures || []
          };
        }
      }
} catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating treatment plan:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async update(id, planData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };
      
      if (planData.name) updateData.Name = planData.name;
      if (planData.patientId) updateData.patient_id_c = parseInt(planData.patientId);
      if (planData.status) updateData.status_c = planData.status;
      if (planData.totalCost !== undefined) updateData.total_cost_c = parseFloat(planData.totalCost);
      if (planData.totalInsuranceCovered !== undefined) updateData.total_insurance_covered_c = parseFloat(planData.totalInsuranceCovered);
      if (planData.patientPortion !== undefined) updateData.patient_portion_c = parseFloat(planData.patientPortion);

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update treatment plan ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulUpdate = response.results.find(result => result.success);
        if (successfulUpdate) {
          const plan = successfulUpdate.data;
          return {
            Id: plan.Id,
            name: plan.Name,
            patientId: plan.patient_id_c?.toString(),
            status: plan.status_c,
            totalCost: plan.total_cost_c,
            totalInsuranceCovered: plan.total_insurance_covered_c,
            patientPortion: plan.patient_portion_c,
            procedures: planData.procedures || []
          };
        }
      }
    } catch (error) {
if (error?.response?.data?.message) {
        console.error("Error updating treatment plan:", error?.response?.data?.message);
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

      const response = await apperClient.deleteRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete treatment plan ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        return response.results.some(result => result.success);
      }
return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting treatment plan:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  },

  async updateProcedureOrder(planId, procedures) {
    // For now, this would require a separate procedures table or JSON field
    // Since procedures are currently handled in memory, we'll maintain the same structure
    return {
      Id: parseInt(planId),
      procedures
    };
  },

  async calculateTotals(procedures) {
    // This function can remain as client-side calculation
    const totalCost = procedures.reduce((sum, proc) => sum + (proc.cost || 0), 0);
    const totalInsuranceCovered = procedures.reduce((sum, proc) => sum + (proc.insuranceCovered || 0), 0);
    const patientPortion = totalCost - totalInsuranceCovered;
    
    return {
      totalCost,
      totalInsuranceCovered,
      patientPortion,
      procedureCount: procedures.length
    };
  }
};