import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, PlusCircle, FilterIcon } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const fields = [
  { value: "name", label: "Candidate Name" },
  { value: "title", label: "Job Title" },
  { value: "company", label: "Company" },
  { value: "email", label: "Email Address" },
  { value: "phone", label: "Phone Number" },
  { value: "social_media", label: "Social Media" },
  { value: "recruiter_name", label: "Recruiter Name" },
  { value: "coordinator_name", label: "Coordinator Name" },
];

const ConditionsComponent = ({ onSaveConditions }) => {
  const [conditions, setConditions] = useState([{ id: 1, field: '', condition: '', value: '' }]);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  const handleConditionChange = (id, key, value) => {
    setConditions(prevConditions =>
      prevConditions.map(condition =>
        condition.id === id ? { ...condition, [key]: value } : condition
      )
    );
  };

  const addCondition = () => {
    setConditions(prevConditions => [
      ...prevConditions,
      { id: prevConditions.length + 1, field: '', condition: '', value: '' },
    ]);
  };

  const removeCondition = (id) => {
    setConditions(prevConditions => prevConditions.filter(condition => condition.id !== id));
  };

  useEffect(() => {
    // Check if all fields in all conditions are filled
    const allFieldsFilled = conditions.every(
      condition => condition.field && condition.condition && condition.value
    );
    setIsSaveEnabled(allFieldsFilled);
  }, [conditions]);

  const handleSave = () => {
    if (isSaveEnabled) {
      onSaveConditions(conditions);
      // Reset conditions after saving
      setConditions([{ id: 1, field: '', condition: '', value: '' }]);
    }
  };

  return (
    <div className="conditions-sidebar p-2 flex flex-col justify-between h-full">
      <div>
        {/* Title and Description */}
        <div className="flex items-center mb-4">
          <FilterIcon width={40} height={40} className="mx-2"/>
          <h2 className="text-xl font-semibold">Filter Conditions</h2>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Set up rules to refine your workflow based on specific conditions.
        </p>

        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <Card key={condition.id} className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  Condition
                  <Button variant="ghost" onClick={() => removeCondition(condition.id)} className="ml-auto text-red-600 hover:bg-red-100">
                    <Trash2 className="mr-2" /> Remove
                  </Button>
                </CardTitle>
                <CardDescription>Define a condition to filter on.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <div>
                    <Select
                      value={condition.field}
                      onValueChange={value => handleConditionChange(condition.id, 'field', value)}
                    >
                      <SelectTrigger id={`field-${condition.id}`} className="w-full mt-1">
                        <SelectValue placeholder="Choose field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map(field => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={condition.condition}
                      onValueChange={value => handleConditionChange(condition.id, 'condition', value)}
                    >
                      <SelectTrigger id={`condition-${condition.id}`} className="w-full mt-1">
                        <SelectValue placeholder="Choose condition..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={e => handleConditionChange(condition.id, 'value', e.target.value)}
                      placeholder="Enter value..."
                      id={`value-${condition.id}`}
                      className="w-full mt-1 p-2 border rounded"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button variant="outline" onClick={addCondition} className="w-full flex items-center justify-center">
            <PlusCircle className="mr-2" /> Add Condition
          </Button>
        </div>
      </div>

      <div>
        <Separator />
        <div className="p-6">
          <Button
            disabled={!isSaveEnabled}
            onClick={handleSave}
            className="w-full bg-blue-600 text-white"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConditionsComponent;
