const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'patient_c';

export const patientService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "date_of_birth_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "insurance_provider_c" } },
          { field: { Name: "insurance_id_c" } },
          { field: { Name: "medical_history_c" } },
          { field: { Name: "allergies_c" } },
          { field: { Name: "last_visit_c" } },
          { field: { Name: "next_appointment_c" } }
        ]
      };

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to UI format
      return response.data.map(patient => ({
        Id: patient.Id,
        firstName: patient.first_name_c,
        lastName: patient.last_name_c,
        dateOfBirth: patient.date_of_birth_c,
        phone: patient.phone_c,
        email: patient.email_c,
        address: patient.address_c,
        insuranceProvider: patient.insurance_provider_c,
        insuranceId: patient.insurance_id_c,
        medicalHistory: patient.medical_history_c ? patient.medical_history_c.split(',') : [],
        allergies: patient.allergies_c ? patient.allergies_c.split(',') : [],
        lastVisit: patient.last_visit_c,
        nextAppointment: patient.next_appointment_c
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching patients:", error?.response?.data?.message);
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
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "date_of_birth_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "insurance_provider_c" } },
          { field: { Name: "insurance_id_c" } },
          { field: { Name: "medical_history_c" } },
          { field: { Name: "allergies_c" } },
          { field: { Name: "last_visit_c" } },
          { field: { Name: "next_appointment_c" } }
        ]
      };

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const patient = response.data;
      return {
        Id: patient.Id,
        firstName: patient.first_name_c,
        lastName: patient.last_name_c,
        dateOfBirth: patient.date_of_birth_c,
        phone: patient.phone_c,
        email: patient.email_c,
        address: patient.address_c,
        insuranceProvider: patient.insurance_provider_c,
        insuranceId: patient.insurance_id_c,
        medicalHistory: patient.medical_history_c ? patient.medical_history_c.split(',') : [],
        allergies: patient.allergies_c ? patient.allergies_c.split(',') : [],
        lastVisit: patient.last_visit_c,
        nextAppointment: patient.next_appointment_c
      };
    } catch (error) {
if (error?.response?.data?.message) {
        console.error(`Error fetching patient with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async create(patientData) {
    try {
      const params = {
        records: [
          {
            Name: `${patientData.firstName} ${patientData.lastName}`,
            first_name_c: patientData.firstName,
            last_name_c: patientData.lastName,
            date_of_birth_c: patientData.dateOfBirth,
            phone_c: patientData.phone,
            email_c: patientData.email,
            address_c: patientData.address,
            insurance_provider_c: patientData.insuranceProvider,
            insurance_id_c: patientData.insuranceId,
            medical_history_c: Array.isArray(patientData.medicalHistory) ? patientData.medicalHistory.join(',') : '',
            allergies_c: Array.isArray(patientData.allergies) ? patientData.allergies.join(',') : '',
            last_visit_c: patientData.lastVisit,
            next_appointment_c: patientData.nextAppointment
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
          console.error(`Failed to create patient ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          const patient = successfulRecord.data;
          return {
            Id: patient.Id,
            firstName: patient.first_name_c,
            lastName: patient.last_name_c,
            dateOfBirth: patient.date_of_birth_c,
            phone: patient.phone_c,
            email: patient.email_c,
            address: patient.address_c,
            insuranceProvider: patient.insurance_provider_c,
            insuranceId: patient.insurance_id_c,
            medicalHistory: patient.medical_history_c ? patient.medical_history_c.split(',') : [],
            allergies: patient.allergies_c ? patient.allergies_c.split(',') : [],
            lastVisit: patient.last_visit_c,
            nextAppointment: patient.next_appointment_c
          };
        }
      }
    } catch (error) {
if (error?.response?.data?.message) {
        console.error("Error creating patient:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async update(id, patientData) {
    try {
      const updateData = {};
      
      if (patientData.firstName || patientData.lastName) {
        updateData.Name = `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim();
      }
      if (patientData.firstName) updateData.first_name_c = patientData.firstName;
      if (patientData.lastName) updateData.last_name_c = patientData.lastName;
      if (patientData.dateOfBirth) updateData.date_of_birth_c = patientData.dateOfBirth;
      if (patientData.phone) updateData.phone_c = patientData.phone;
      if (patientData.email) updateData.email_c = patientData.email;
      if (patientData.address) updateData.address_c = patientData.address;
      if (patientData.insuranceProvider) updateData.insurance_provider_c = patientData.insuranceProvider;
      if (patientData.insuranceId) updateData.insurance_id_c = patientData.insuranceId;
      if (patientData.medicalHistory) updateData.medical_history_c = Array.isArray(patientData.medicalHistory) ? patientData.medicalHistory.join(',') : patientData.medicalHistory;
      if (patientData.allergies) updateData.allergies_c = Array.isArray(patientData.allergies) ? patientData.allergies.join(',') : patientData.allergies;
      if (patientData.lastVisit) updateData.last_visit_c = patientData.lastVisit;
      if (patientData.nextAppointment) updateData.next_appointment_c = patientData.nextAppointment;

      const params = {
        records: [
          {
            Id: parseInt(id),
            ...updateData
          }
        ]
      };

      const response = await apperClient.updateRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update patient ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulUpdate = response.results.find(result => result.success);
        if (successfulUpdate) {
          const patient = successfulUpdate.data;
          return {
            Id: patient.Id,
            firstName: patient.first_name_c,
            lastName: patient.last_name_c,
            dateOfBirth: patient.date_of_birth_c,
            phone: patient.phone_c,
            email: patient.email_c,
            address: patient.address_c,
            insuranceProvider: patient.insurance_provider_c,
            insuranceId: patient.insurance_id_c,
            medicalHistory: patient.medical_history_c ? patient.medical_history_c.split(',') : [],
            allergies: patient.allergies_c ? patient.allergies_c.split(',') : [],
            lastVisit: patient.last_visit_c,
            nextAppointment: patient.next_appointment_c
          };
        }
}
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating patient:", error?.response?.data?.message);
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
          console.error(`Failed to delete patient ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
return response.results.some(result => result.success);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting patient:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  },

  async search(query) {
    try {
      if (!query.trim()) {
        return await this.getAll();
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "email_c" } }
        ],
        where: [
          {
            FieldName: "Name",
            Operator: "Contains",
            Values: [query]
          }
        ]
      };

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(patient => ({
        Id: patient.Id,
        firstName: patient.first_name_c,
        lastName: patient.last_name_c,
        phone: patient.phone_c,
        email: patient.email_c
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching patients:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
}
};