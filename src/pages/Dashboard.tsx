
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { useWorksheet } from '@/contexts/WorksheetContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { worksheets, createWorksheet } = useWorksheet();
  const [newWorksheetName, setNewWorksheetName] = React.useState('');
  
  const handleCreateWorksheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorksheetName.trim()) {
      createWorksheet(newWorksheetName);
      setNewWorksheetName('');
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-gray-500">Manage your worksheets and data integrations</p>
        </div>
        
        <form onSubmit={handleCreateWorksheet} className="flex mt-4 md:mt-0 gap-2">
          <Input
            placeholder="New worksheet name"
            value={newWorksheetName}
            onChange={(e) => setNewWorksheetName(e.target.value)}
            className="w-64"
          />
          <Button type="submit">Create Worksheet</Button>
        </form>
      </div>
      
      {worksheets.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
          <h2 className="text-xl font-medium text-gray-600">No worksheets yet</h2>
          <p className="text-gray-500 mt-2">Create your first worksheet to get started</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {worksheets.map((worksheet) => (
            <Card key={worksheet.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>{worksheet.name}</CardTitle>
                <CardDescription>
                  {worksheet.rows.length} rows, {worksheet.columns.length} columns
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(worksheet.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">Last updated:</span> {formatDate(worksheet.updatedAt)}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between bg-gray-50 border-t">
                <Button variant="outline" asChild>
                  <Link to={`/worksheet/${worksheet.id}`}>Open</Link>
                </Button>
                <Button variant="ghost" className="text-red-500">Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
