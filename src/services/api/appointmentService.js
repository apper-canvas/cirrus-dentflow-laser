const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'appointment_c';

export const appointmentService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_time_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "provider_c" } },
          { field: { Name: "room_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "status_c" } },
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

      return response.data.map(appointment => ({
        Id: appointment.Id,
        patientId: appointment.patient_id_c?.Id?.toString() || appointment.patient_id_c,
        dateTime: appointment.date_time_c,
        duration: appointment.duration_c,
        type: appointment.type_c,
        status: appointment.status_c,
        provider: appointment.provider_c,
        room: appointment.room_c,
        notes: appointment.notes_c
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching appointments:", error?.response?.data?.message);
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
          { field: { Name: "date_time_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "provider_c" } },
          { field: { Name: "room_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "status_c" } },
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

      const appointment = response.data;
      return {
        Id: appointment.Id,
        patientId: appointment.patient_id_c?.Id?.toString() || appointment.patient_id_c,
        dateTime: appointment.date_time_c,
        duration: appointment.duration_c,
        type: appointment.type_c,
        status: appointment.status_c,
        provider: appointment.provider_c,
        room: appointment.room_c,
        notes: appointment.notes_c
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching appointment with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw new Error("Appointment not found");
    }
  },

  async getByPatientId(patientId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_time_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "provider_c" } },
          { field: { Name: "room_c" } },
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

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(appointment => ({
        Id: appointment.Id,
        patientId: patientId.toString(),
        dateTime: appointment.date_time_c,
        duration: appointment.duration_c,
        type: appointment.type_c,
        status: appointment.status_c,
        provider: appointment.provider_c,
        room: appointment.room_c,
        notes: appointment.notes_c
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching appointments by patient ID:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getTodaysAppointments() {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_time_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "provider_c" } },
          { field: { Name: "room_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "patient_id_c" } }
        ],
        where: [
          {
            FieldName: "date_time_c",
            Operator: "RelativeMatch",
            Values: ["Today"]
          }
        ]
      };

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(appointment => ({
        Id: appointment.Id,
        patientId: appointment.patient_id_c?.toString(),
        dateTime: appointment.date_time_c,
        duration: appointment.duration_c,
        type: appointment.type_c,
        status: appointment.status_c,
        provider: appointment.provider_c,
        room: appointment.room_c,
        notes: appointment.notes_c
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching today's appointments:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async create(appointmentData) {
    try {
      const params = {
        records: [
          {
            Name: `${appointmentData.type} - ${new Date(appointmentData.dateTime).toLocaleDateString()}`,
            patient_id_c: parseInt(appointmentData.patientId),
            date_time_c: appointmentData.dateTime,
            duration_c: parseInt(appointmentData.duration),
            type_c: appointmentData.type,
            provider_c: appointmentData.provider,
            room_c: appointmentData.room,
            notes_c: appointmentData.notes,
            status_c: appointmentData.status || "pending"
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
          console.error(`Failed to create appointment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          const appointment = successfulRecord.data;
          return {
            Id: appointment.Id,
            patientId: appointmentData.patientId,
            dateTime: appointment.date_time_c,
            duration: appointment.duration_c,
            type: appointment.type_c,
            status: appointment.status_c,
            provider: appointment.provider_c,
            room: appointment.room_c,
            notes: appointment.notes_c
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating appointment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, appointmentData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };
      
      if (appointmentData.patientId) updateData.patient_id_c = parseInt(appointmentData.patientId);
      if (appointmentData.dateTime) updateData.date_time_c = appointmentData.dateTime;
      if (appointmentData.duration) updateData.duration_c = parseInt(appointmentData.duration);
      if (appointmentData.type) updateData.type_c = appointmentData.type;
      if (appointmentData.provider) updateData.provider_c = appointmentData.provider;
      if (appointmentData.room) updateData.room_c = appointmentData.room;
      if (appointmentData.notes) updateData.notes_c = appointmentData.notes;
      if (appointmentData.status) updateData.status_c = appointmentData.status;
      
      if (appointmentData.type && appointmentData.dateTime) {
        updateData.Name = `${appointmentData.type} - ${new Date(appointmentData.dateTime).toLocaleDateString()}`;
      }

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
          console.error(`Failed to update appointment ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulUpdate = response.results.find(result => result.success);
        if (successfulUpdate) {
          const appointment = successfulUpdate.data;
          return {
            Id: appointment.Id,
            patientId: appointment.patient_id_c?.toString(),
            dateTime: appointment.date_time_c,
            duration: appointment.duration_c,
            type: appointment.type_c,
            status: appointment.status_c,
            provider: appointment.provider_c,
            room: appointment.room_c,
            notes: appointment.notes_c
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating appointment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async updateStatus(id, status) {
    return await this.update(id, { status });
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
          console.error(`Failed to delete appointment ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        return response.results.some(result => result.success);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting appointment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
};