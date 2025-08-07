import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import ProcedureLibrary from "@/components/molecules/ProcedureLibrary";
import ProcedurePlanItem from "@/components/molecules/ProcedurePlanItem";
import CostEstimator from "@/components/molecules/CostEstimator";
import { treatmentPlanService } from "@/services/api/treatmentPlanService";
import { patientService } from "@/services/api/patientService";
import { treatmentService } from "@/services/api/treatmentService";

const TreatmentPlanBuilder = ({ onClose, planId = null }) => {
  const [planName, setPlanName] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [plannedProcedures, setPlannedProcedures] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [costTotals, setCostTotals] = useState({
    totalCost: 0,
    totalInsuranceCovered: 0,
    patientPortion: 0,
    procedureCount: 0
  });

const [availableProcedures, setAvailableProcedures] = useState([]);

  useEffect(() => {
    loadPatients();
    if (planId) {
      loadExistingPlan();
    }
  }, [planId]);

  useEffect(() => {
    calculateTotals();
  }, [plannedProcedures]);

const loadPatients = async () => {
    try {
      const patientsData = await patientService.getAll();
      setPatients(patientsData);
    } catch (error) {
      toast.error("Failed to load patients");
    }
  };

  const loadProcedureLibrary = async () => {
    try {
      const procedures = await treatmentService.getProcedureLibrary();
      setAvailableProcedures(procedures);
    } catch (error) {
      toast.error("Failed to load procedure library");
    }
  };

  useEffect(() => {
    loadPatients();
    loadProcedureLibrary();
  }, []);
  const loadExistingPlan = async () => {
    try {
      setIsLoading(true);
      const plan = await treatmentPlanService.getById(planId);
      setPlanName(plan.name);
      setSelectedPatientId(plan.patientId);
      setPlannedProcedures(plan.procedures || []);
    } catch (error) {
      toast.error("Failed to load treatment plan");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = async () => {
    try {
      const totals = await treatmentPlanService.calculateTotals(plannedProcedures);
      setCostTotals(totals);
    } catch (error) {
      console.error("Failed to calculate totals:", error);
    }
  };

  const handleDragStart = (e, procedure) => {
    setDraggedItem(procedure);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItem) {
      const newProcedure = {
        ...draggedItem,
        planItemId: Date.now(),
        order: plannedProcedures.length + 1,
        selectedTeeth: [],
        notes: ""
      };
      setPlannedProcedures(prev => [...prev, newProcedure]);
      setDraggedItem(null);
      toast.success(`Added ${draggedItem.name} to treatment plan`);
    }
  };

  const handleRemoveProcedure = (planItemId) => {
    setPlannedProcedures(prev => prev.filter(p => p.planItemId !== planItemId));
    toast.success("Procedure removed from plan");
  };

  const handleReorderProcedures = async (reorderedProcedures) => {
    const updatedProcedures = reorderedProcedures.map((proc, index) => ({
      ...proc,
      order: index + 1
    }));
    setPlannedProcedures(updatedProcedures);
  };

  const handleUpdateProcedure = (planItemId, updates) => {
    setPlannedProcedures(prev => 
      prev.map(p => p.planItemId === planItemId ? { ...p, ...updates } : p)
    );
  };

  const handleSavePlan = async () => {
    if (!planName.trim() || !selectedPatientId || plannedProcedures.length === 0) {
      toast.error("Please fill all required fields and add at least one procedure");
      return;
    }

    try {
      setIsLoading(true);
      
      const planData = {
        name: planName,
        patientId: selectedPatientId,
        procedures: plannedProcedures,
        status: "draft",
        totalCost: costTotals.totalCost,
        totalInsuranceCovered: costTotals.totalInsuranceCovered,
        patientPortion: costTotals.patientPortion
      };

      if (planId) {
        await treatmentPlanService.update(planId, planData);
        toast.success("Treatment plan updated successfully");
      } else {
        await treatmentPlanService.create(planData);
        toast.success("Treatment plan created successfully");
      }
      
      onClose();
    } catch (error) {
      toast.error("Failed to save treatment plan");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && planId) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading treatment plan...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {planId ? "Edit Treatment Plan" : "Create Treatment Plan"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Build comprehensive treatment plans with cost estimates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Procedure Library */}
          <div className="w-1/3 border-r border-gray-200 overflow-hidden">
            <ProcedureLibrary
              procedures={availableProcedures}
              onDragStart={handleDragStart}
            />
          </div>

          {/* Center Panel - Treatment Plan Builder */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Plan Info */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Plan Name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Enter treatment plan name"
                  required
                />
                <Select
                  label="Patient"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                >
                  <option value="">Select a patient</option>
{patients.map(patient => (
                    <option key={patient.Id} value={patient.Id}>
                      {patient.firstName || patient.first_name_c} {patient.lastName || patient.last_name_c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              className="flex-1 p-6 overflow-y-auto"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {plannedProcedures.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <ApperIcon name="Plus" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start Building Your Treatment Plan
                  </h3>
                  <p className="text-gray-600">
                    Drag procedures from the library to add them to the plan
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Planned Procedures ({plannedProcedures.length})
                    </h3>
                    <div className="text-sm text-gray-600">
                      Drag to reorder procedures
                    </div>
                  </div>
                  
                  {plannedProcedures
                    .sort((a, b) => a.order - b.order)
                    .map((procedure, index) => (
                      <ProcedurePlanItem
                        key={procedure.planItemId}
                        procedure={procedure}
                        index={index}
                        onRemove={handleRemoveProcedure}
                        onUpdate={handleUpdateProcedure}
                        onReorder={handleReorderProcedures}
                        allProcedures={plannedProcedures}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Cost Estimator */}
          <div className="w-1/3 border-l border-gray-200 overflow-hidden">
            <CostEstimator
              procedures={plannedProcedures}
              totals={costTotals}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {costTotals.procedureCount} procedures • 
            Total: ${costTotals.totalCost.toFixed(2)} • 
            Patient Portion: ${costTotals.patientPortion.toFixed(2)}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePlan}
              disabled={isLoading || !planName.trim() || !selectedPatientId || plannedProcedures.length === 0}
              isLoading={isLoading}
            >
              {planId ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlanBuilder;