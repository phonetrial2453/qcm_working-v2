import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

// Define the schema for form validation
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full Name must be at least 2 characters." }),
  mobile: z.string().regex(/^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,}\)?[-.\s]?)?(\d{1,}[-.\s]?)?[\d\s]+$/, { message: "Invalid Mobile Number" }),
  whatsapp: z.string().regex(/^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,}\)?[-.\s]?)?(\d{1,}[-.\s]?)?[\d\s]+$/, { message: "Invalid WhatsApp Number" }).optional(),
  email: z.string().email({ message: "Invalid Email Address" }),
  age: z.number().min(18, { message: "Age must be at least 18" }).optional(),
  qualification: z.string().optional(),
  profession: z.string().optional(),
  area: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  currentArea: z.string().optional(),
  currentMandal: z.string().optional(),
  currentCity: z.string().optional(),
  currentState: z.string().optional(),
  referredByFullName: z.string().optional(),
  referredByMobile: z.string().regex(/^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,}\)?[-.\s]?)?(\d{1,}[-.\s]?)?[\d\s]+$/, { message: "Invalid Mobile Number" }).optional(),
  referredByStudentId: z.string().optional(),
  referredByBatch: z.string().optional(),
  remarks: z.string().optional(),
  classCode: z.string().min(1, { message: "Please select a class." }),
});

const NewApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, error, loading } = useApplications();
  const { user } = useAuth();
  const [submitLoading, setSubmitLoading] = useState(false);

  // Initialize react-hook-form
  const { register, handleSubmit, formState: { errors }, control, setValue } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      mobile: '',
      whatsapp: '',
      email: '',
      age: undefined,
      qualification: '',
      profession: '',
      area: '',
      city: '',
      district: '',
      state: '',
      currentArea: '',
      currentMandal: '',
      currentCity: '',
      currentState: '',
      referredByFullName: '',
      referredByMobile: '',
      referredByStudentId: '',
      referredByBatch: '',
      remarks: '',
      classCode: '',
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error!",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setSubmitLoading(true);
    try {
      // Prepare the application data
      const applicationData = {
        studentDetails: {
          fullName: data.fullName,
          mobile: data.mobile,
          whatsapp: data.whatsapp,
        },
        otherDetails: {
          email: data.email,
          age: data.age,
          qualification: data.qualification,
          profession: data.profession,
        },
        hometownDetails: {
          area: data.area,
          city: data.city,
          district: data.district,
          state: data.state,
        },
        currentResidence: {
          area: data.currentArea,
          mandal: data.currentMandal,
          city: data.currentCity,
          state: data.currentState,
        },
        referredBy: {
          fullName: data.referredByFullName,
          mobile: data.referredByMobile,
          studentId: data.referredByStudentId,
          batch: data.referredByBatch,
        },
        remarks: data.remarks,
        classCode: data.classCode,
        status: 'pending', // Set initial status
      };

      // Submit the application using Supabase client
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        // Handle successful submission
        toast({
          title: "Application submitted successfully!",
          description: "Your application has been submitted successfully.",
          variant: "default", // Change from "success" to "default"
        });
        navigate('/applications');
      } else {
        // Handle submission error
        const errorData = await response.json();
        toast({
          title: "Error submitting application!",
          description: errorData.message || 'An error occurred while submitting the application.',
          variant: "destructive",
        });
      }
    } catch (err: any) {
      // Handle unexpected errors
      toast({
        title: "Unexpected error!",
        description: err.message || 'An unexpected error occurred.',
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">New Application</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" type="text" {...register("fullName")} />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
        </div>
        <div>
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input id="mobile" type="text" {...register("mobile")} />
          {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile.message}</p>}
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
          <Input id="whatsapp" type="text" {...register("whatsapp")} />
          {errors.whatsapp && <p className="text-red-500 text-sm">{errors.whatsapp.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="age">Age (Optional)</Label>
          <Input id="age" type="number" {...register("age", { valueAsNumber: true })} />
          {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
        </div>
        <div>
          <Label htmlFor="qualification">Qualification (Optional)</Label>
          <Input id="qualification" type="text" {...register("qualification")} />
        </div>
        <div>
          <Label htmlFor="profession">Profession (Optional)</Label>
          <Input id="profession" type="text" {...register("profession")} />
        </div>
        <div>
          <Label>Hometown Details</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Area (Optional)</Label>
              <Input id="area" type="text" {...register("area")} />
            </div>
            <div>
              <Label htmlFor="city">City (Optional)</Label>
              <Input id="city" type="text" {...register("city")} />
            </div>
            <div>
              <Label htmlFor="district">District (Optional)</Label>
              <Input id="district" type="text" {...register("district")} />
            </div>
            <div>
              <Label htmlFor="state">State (Optional)</Label>
              <Input id="state" type="text" {...register("state")} />
            </div>
          </div>
        </div>
        <div>
          <Label>Current Residence</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentArea">Area (Optional)</Label>
              <Input id="currentArea" type="text" {...register("currentArea")} />
            </div>
            <div>
              <Label htmlFor="currentMandal">Mandal (Optional)</Label>
              <Input id="currentMandal" type="text" {...register("currentMandal")} />
            </div>
            <div>
              <Label htmlFor="currentCity">City (Optional)</Label>
              <Input id="currentCity" type="text" {...register("currentCity")} />
            </div>
            <div>
              <Label htmlFor="currentState">State (Optional)</Label>
              <Input id="currentState" type="text" {...register("currentState")} />
            </div>
          </div>
        </div>
        <div>
          <Label>Referred By (Optional)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="referredByFullName">Full Name</Label>
              <Input id="referredByFullName" type="text" {...register("referredByFullName")} />
            </div>
            <div>
              <Label htmlFor="referredByMobile">Mobile Number</Label>
              <Input id="referredByMobile" type="text" {...register("referredByMobile")} />
              {errors.referredByMobile && <p className="text-red-500 text-sm">{errors.referredByMobile.message}</p>}
            </div>
            <div>
              <Label htmlFor="referredByStudentId">Student ID</Label>
              <Input id="referredByStudentId" type="text" {...register("referredByStudentId")} />
            </div>
            <div>
              <Label htmlFor="referredByBatch">Batch</Label>
              <Input id="referredByBatch" type="text" {...register("referredByBatch")} />
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="remarks">Remarks (Optional)</Label>
          <Textarea id="remarks" {...register("remarks")} />
        </div>
        <div>
          <Label htmlFor="classCode">Class</Label>
          <Select onValueChange={(value) => setValue('classCode', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.code}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classCode && <p className="text-red-500 text-sm">{errors.classCode.message}</p>}
        </div>
        <Button type="submit" disabled={submitLoading}>
          {submitLoading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </div>
  );
};

export default NewApplicationPage;
