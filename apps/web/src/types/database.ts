export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      AlternateItem: {
        Row: {
          alternateId: string
          id: number
          lineItemId: number
        }
        Insert: {
          alternateId: string
          id?: number
          lineItemId: number
        }
        Update: {
          alternateId?: string
          id?: number
          lineItemId?: number
        }
        Relationships: [
          {
            foreignKeyName: "AlternateItem_lineItemId_fkey"
            columns: ["lineItemId"]
            isOneToOne: false
            referencedRelation: "LineItem"
            referencedColumns: ["id"]
          },
        ]
      }
      Annotation: {
        Row: {
          coordinates: Json
          createdAt: string
          id: number
          imageId: number
          isDeleted: boolean
          updatedAt: string
          userId: string
        }
        Insert: {
          coordinates: Json
          createdAt?: string
          id?: number
          imageId: number
          isDeleted?: boolean
          updatedAt?: string
          userId: string
        }
        Update: {
          coordinates?: Json
          createdAt?: string
          id?: number
          imageId?: number
          isDeleted?: boolean
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Annotation_imageId_fkey"
            columns: ["imageId"]
            isOneToOne: false
            referencedRelation: "Image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Annotation_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      AreaAffected: {
        Row: {
          cabinetryRemoved: string | null
          category: number | null
          cause: string | null
          createdAt: string
          date: string
          id: number
          isDeleted: boolean
          material: string | null
          projectId: number
          publicId: string
          roomId: number
          totalAreaMicrobialApplied: string | null
          totalAreaRemoved: string | null
          type: Database["public"]["Enums"]["AreaAffectedType"]
        }
        Insert: {
          cabinetryRemoved?: string | null
          category?: number | null
          cause?: string | null
          createdAt?: string
          date?: string
          id?: number
          isDeleted?: boolean
          material?: string | null
          projectId: number
          publicId: string
          roomId: number
          totalAreaMicrobialApplied?: string | null
          totalAreaRemoved?: string | null
          type: Database["public"]["Enums"]["AreaAffectedType"]
        }
        Update: {
          cabinetryRemoved?: string | null
          category?: number | null
          cause?: string | null
          createdAt?: string
          date?: string
          id?: number
          isDeleted?: boolean
          material?: string | null
          projectId?: number
          publicId?: string
          roomId?: number
          totalAreaMicrobialApplied?: string | null
          totalAreaRemoved?: string | null
          type?: Database["public"]["Enums"]["AreaAffectedType"]
        }
        Relationships: [
          {
            foreignKeyName: "AreaAffected_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AreaAffected_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "Room"
            referencedColumns: ["id"]
          },
        ]
      }
      CalendarEvent: {
        Row: {
          createdAt: string
          date: string
          dynamicId: string
          end: string | null
          id: number
          isDeleted: boolean
          organizationId: string | null
          payload: string
          projectId: number | null
          publicId: string
          remindClient: boolean
          reminderTime: string | null
          remindProjectOwners: boolean
          start: string | null
          subject: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          date: string
          dynamicId: string
          end?: string | null
          id?: number
          isDeleted?: boolean
          organizationId?: string | null
          payload: string
          projectId?: number | null
          publicId: string
          remindClient?: boolean
          reminderTime?: string | null
          remindProjectOwners?: boolean
          start?: string | null
          subject: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          date?: string
          dynamicId?: string
          end?: string | null
          id?: number
          isDeleted?: boolean
          organizationId?: string | null
          payload?: string
          projectId?: number | null
          publicId?: string
          remindClient?: boolean
          reminderTime?: string | null
          remindProjectOwners?: boolean
          start?: string | null
          subject?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "CalendarEvent_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["publicId"]
          },
          {
            foreignKeyName: "CalendarEvent_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      CalendarEventReminder: {
        Row: {
          calendarEventId: number | null
          createdAt: string
          date: string
          email: string | null
          emailSentAt: string | null
          id: number
          phone: string | null
          reminderTarget: Database["public"]["Enums"]["ReminderTarget"]
          sendEmail: boolean
          sendText: boolean
          textSentAt: string | null
          updatedAt: string
        }
        Insert: {
          calendarEventId?: number | null
          createdAt?: string
          date: string
          email?: string | null
          emailSentAt?: string | null
          id?: number
          phone?: string | null
          reminderTarget: Database["public"]["Enums"]["ReminderTarget"]
          sendEmail?: boolean
          sendText?: boolean
          textSentAt?: string | null
          updatedAt?: string
        }
        Update: {
          calendarEventId?: number | null
          createdAt?: string
          date?: string
          email?: string | null
          emailSentAt?: string | null
          id?: number
          phone?: string | null
          reminderTarget?: Database["public"]["Enums"]["ReminderTarget"]
          sendEmail?: boolean
          sendText?: boolean
          textSentAt?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "CalendarEventReminder_calendarEventId_fkey"
            columns: ["calendarEventId"]
            isOneToOne: false
            referencedRelation: "CalendarEvent"
            referencedColumns: ["id"]
          },
        ]
      }
      Cost: {
        Row: {
          actualCost: number | null
          createdAt: string
          estimatedCost: number | null
          id: number
          isDeleted: boolean
          name: string | null
          projectId: number
          type: Database["public"]["Enums"]["CostType"]
          updatedAt: string
        }
        Insert: {
          actualCost?: number | null
          createdAt?: string
          estimatedCost?: number | null
          id?: number
          isDeleted?: boolean
          name?: string | null
          projectId: number
          type: Database["public"]["Enums"]["CostType"]
          updatedAt?: string
        }
        Update: {
          actualCost?: number | null
          createdAt?: string
          estimatedCost?: number | null
          id?: number
          isDeleted?: boolean
          name?: string | null
          projectId?: number
          type?: Database["public"]["Enums"]["CostType"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Cost_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      Customers: {
        Row: {
          billingAddress: Json | null
          customerId: string
          id: number
          organizationId: number
          paymentMethod: Json | null
        }
        Insert: {
          billingAddress?: Json | null
          customerId: string
          id?: number
          organizationId: number
          paymentMethod?: Json | null
        }
        Update: {
          billingAddress?: Json | null
          customerId?: string
          id?: number
          organizationId?: number
          paymentMethod?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "Customers_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      DataDeletionRequest: {
        Row: {
          createdAt: string
          email: string
          fullName: string
          id: number
          isVerified: boolean
        }
        Insert: {
          createdAt?: string
          email: string
          fullName: string
          id?: number
          isVerified?: boolean
        }
        Update: {
          createdAt?: string
          email?: string
          fullName?: string
          id?: number
          isVerified?: boolean
        }
        Relationships: []
      }
      Detection: {
        Row: {
          category: string
          code: string
          confidence: number | null
          createdAt: string
          dimension: number | null
          id: number
          imageKey: string | null
          inferenceId: number
          isDeleted: boolean
          item: string
          projectId: number
          publicId: string
          quality: string
          roomId: number | null
          unit: Database["public"]["Enums"]["DimensionUnit"] | null
          xMaxCord: number | null
          xMinCord: number | null
          yMaxCord: number | null
          yMinCord: number | null
        }
        Insert: {
          category: string
          code: string
          confidence?: number | null
          createdAt?: string
          dimension?: number | null
          id?: number
          imageKey?: string | null
          inferenceId: number
          isDeleted?: boolean
          item: string
          projectId: number
          publicId: string
          quality: string
          roomId?: number | null
          unit?: Database["public"]["Enums"]["DimensionUnit"] | null
          xMaxCord?: number | null
          xMinCord?: number | null
          yMaxCord?: number | null
          yMinCord?: number | null
        }
        Update: {
          category?: string
          code?: string
          confidence?: number | null
          createdAt?: string
          dimension?: number | null
          id?: number
          imageKey?: string | null
          inferenceId?: number
          isDeleted?: boolean
          item?: string
          projectId?: number
          publicId?: string
          quality?: string
          roomId?: number | null
          unit?: Database["public"]["Enums"]["DimensionUnit"] | null
          xMaxCord?: number | null
          xMinCord?: number | null
          yMaxCord?: number | null
          yMinCord?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Detection_inferenceId_fkey"
            columns: ["inferenceId"]
            isOneToOne: false
            referencedRelation: "Inference"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Detection_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "Room"
            referencedColumns: ["id"]
          },
        ]
      }
      Document: {
        Row: {
          created_at: string
          id: number
          json: Json | null
          name: string | null
          orgId: number | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          json?: Json | null
          name?: string | null
          orgId?: number | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          json?: Json | null
          name?: string | null
          orgId?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Document_orgId_fkey"
            columns: ["orgId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      Equipment: {
        Row: {
          createdAt: string
          id: number
          isDeleted: boolean
          name: string
          organizationId: number
          publicId: string
          quantity: number
        }
        Insert: {
          createdAt?: string
          id?: number
          isDeleted?: boolean
          name: string
          organizationId: number
          publicId: string
          quantity?: number
        }
        Update: {
          createdAt?: string
          id?: number
          isDeleted?: boolean
          name?: string
          organizationId?: number
          publicId?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "Equipment_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      EstimateItems: {
        Row: {
          amount: number
          createdAt: string | null
          description: string
          estimatePublicId: string
          id: string
          isDeleted: boolean | null
          publicId: string
          quantity: number
          rate: number
          sortOrder: number | null
          updatedAt: string | null
        }
        Insert: {
          amount: number
          createdAt?: string | null
          description: string
          estimatePublicId: string
          id?: string
          isDeleted?: boolean | null
          publicId?: string
          quantity: number
          rate: number
          sortOrder?: number | null
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          createdAt?: string | null
          description?: string
          estimatePublicId?: string
          id?: string
          isDeleted?: boolean | null
          publicId?: string
          quantity?: number
          rate?: number
          sortOrder?: number | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "EstimateItems_estimatePublicId_fkey"
            columns: ["estimatePublicId"]
            isOneToOne: false
            referencedRelation: "Estimates"
            referencedColumns: ["publicId"]
          },
        ]
      }
      Estimates: {
        Row: {
          amount: number
          clientEmail: string | null
          clientName: string
          createdAt: string | null
          daysToPay: number | null
          depositAmount: number | null
          depositPercentage: number | null
          discountAmount: number | null
          estimateDate: string | null
          expiryDate: string | null
          hasPaymentSchedule: boolean | null
          id: string
          isDeleted: boolean | null
          markupAmount: number | null
          markupPercentage: number | null
          notes: string | null
          number: string
          organizationPublicId: string | null
          poNumber: string | null
          projectName: string
          projectPublicId: string | null
          publicId: string
          status: Database["public"]["Enums"]["estimateStatus"]
          subtotal: number
          taxAmount: number | null
          taxRate: number | null
          updatedAt: string | null
          userId: string
        }
        Insert: {
          amount: number
          clientEmail?: string | null
          clientName: string
          createdAt?: string | null
          daysToPay?: number | null
          depositAmount?: number | null
          depositPercentage?: number | null
          discountAmount?: number | null
          estimateDate?: string | null
          expiryDate?: string | null
          hasPaymentSchedule?: boolean | null
          id?: string
          isDeleted?: boolean | null
          markupAmount?: number | null
          markupPercentage?: number | null
          notes?: string | null
          number: string
          organizationPublicId?: string | null
          poNumber?: string | null
          projectName: string
          projectPublicId?: string | null
          publicId?: string
          status?: Database["public"]["Enums"]["estimateStatus"]
          subtotal: number
          taxAmount?: number | null
          taxRate?: number | null
          updatedAt?: string | null
          userId: string
        }
        Update: {
          amount?: number
          clientEmail?: string | null
          clientName?: string
          createdAt?: string | null
          daysToPay?: number | null
          depositAmount?: number | null
          depositPercentage?: number | null
          discountAmount?: number | null
          estimateDate?: string | null
          expiryDate?: string | null
          hasPaymentSchedule?: boolean | null
          id?: string
          isDeleted?: boolean | null
          markupAmount?: number | null
          markupPercentage?: number | null
          notes?: string | null
          number?: string
          organizationPublicId?: string | null
          poNumber?: string | null
          projectName?: string
          projectPublicId?: string | null
          publicId?: string
          status?: Database["public"]["Enums"]["estimateStatus"]
          subtotal?: number
          taxAmount?: number | null
          taxRate?: number | null
          updatedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Estimates_organizationPublicId_fkey"
            columns: ["organizationPublicId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["publicId"]
          },
          {
            foreignKeyName: "Estimates_projectPublicId_fkey"
            columns: ["projectPublicId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["publicId"]
          },
        ]
      }
      Form: {
        Row: {
          created_at: string
          damageTypes: string[] | null
          desc: string | null
          id: number
          name: string | null
          orgId: number | null
        }
        Insert: {
          created_at?: string
          damageTypes?: string[] | null
          desc?: string | null
          id?: number
          name?: string | null
          orgId?: number | null
        }
        Update: {
          created_at?: string
          damageTypes?: string[] | null
          desc?: string | null
          id?: number
          name?: string | null
          orgId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Form_orgId_fkey"
            columns: ["orgId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      FormField: {
        Row: {
          created_at: string
          id: number
          isRequired: boolean | null
          name: string | null
          order: number | null
          sectionId: number | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          isRequired?: boolean | null
          name?: string | null
          order?: number | null
          sectionId?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          isRequired?: boolean | null
          name?: string | null
          order?: number | null
          sectionId?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FormField_sectionId_fkey"
            columns: ["sectionId"]
            isOneToOne: false
            referencedRelation: "FormSection"
            referencedColumns: ["id"]
          },
        ]
      }
      FormOption: {
        Row: {
          created_at: string
          formFieldId: number | null
          id: number
          name: string | null
          order: number | null
          value: string | null
        }
        Insert: {
          created_at?: string
          formFieldId?: number | null
          id?: number
          name?: string | null
          order?: number | null
          value?: string | null
        }
        Update: {
          created_at?: string
          formFieldId?: number | null
          id?: number
          name?: string | null
          order?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FormOption_formFieldId_fkey"
            columns: ["formFieldId"]
            isOneToOne: false
            referencedRelation: "FormField"
            referencedColumns: ["id"]
          },
        ]
      }
      formProjects: {
        Row: {
          created_at: string
          formId: number | null
          id: number
          projectId: number | null
        }
        Insert: {
          created_at?: string
          formId?: number | null
          id?: number
          projectId?: number | null
        }
        Update: {
          created_at?: string
          formId?: number | null
          id?: number
          projectId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "formProjects_formId_fkey"
            columns: ["formId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formProjects_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      FormResponse: {
        Row: {
          created_at: string
          date: string | null
          formId: number | null
          id: number
          projectId: number | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          formId?: number | null
          id?: number
          projectId?: number | null
        }
        Update: {
          created_at?: string
          date?: string | null
          formId?: number | null
          id?: number
          projectId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "FormResponse_formId_fkey"
            columns: ["formId"]
            isOneToOne: false
            referencedRelation: "Form"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FormResponse_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      FormResponseField: {
        Row: {
          created_at: string
          formFieldId: number | null
          formResponseId: number | null
          id: number
          value: string | null
        }
        Insert: {
          created_at?: string
          formFieldId?: number | null
          formResponseId?: number | null
          id?: number
          value?: string | null
        }
        Update: {
          created_at?: string
          formFieldId?: number | null
          formResponseId?: number | null
          id?: number
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FormResponseField_formFieldId_fkey"
            columns: ["formFieldId"]
            isOneToOne: false
            referencedRelation: "FormField"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FormResponseField_formResponseId_fkey"
            columns: ["formResponseId"]
            isOneToOne: false
            referencedRelation: "FormResponse"
            referencedColumns: ["id"]
          },
        ]
      }
      FormSection: {
        Row: {
          created_at: string
          formId: number | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          formId?: number | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          formId?: number | null
          id?: number
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FormSection_formId_fkey"
            columns: ["formId"]
            isOneToOne: false
            referencedRelation: "Form"
            referencedColumns: ["id"]
          },
        ]
      }
      GenericRoomReading: {
        Row: {
          createdAt: string
          gpp: string | null
          humidity: string | null
          id: number
          isDeleted: boolean
          publicId: string
          roomReadingId: number
          temperature: string | null
          type: Database["public"]["Enums"]["RoomReadingType"]
          value: string
        }
        Insert: {
          createdAt?: string
          gpp?: string | null
          humidity?: string | null
          id?: number
          isDeleted?: boolean
          publicId: string
          roomReadingId: number
          temperature?: string | null
          type: Database["public"]["Enums"]["RoomReadingType"]
          value: string
        }
        Update: {
          createdAt?: string
          gpp?: string | null
          humidity?: string | null
          id?: number
          isDeleted?: boolean
          publicId?: string
          roomReadingId?: number
          temperature?: string | null
          type?: Database["public"]["Enums"]["RoomReadingType"]
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "GenericRoomReading_roomReadingId_fkey"
            columns: ["roomReadingId"]
            isOneToOne: false
            referencedRelation: "RoomReading"
            referencedColumns: ["id"]
          },
        ]
      }
      GenericRoomReadingImage: {
        Row: {
          created_at: string
          GenericRoomReadingId: number | null
          id: number
          imageKey: string | null
        }
        Insert: {
          created_at?: string
          GenericRoomReadingId?: number | null
          id?: number
          imageKey?: string | null
        }
        Update: {
          created_at?: string
          GenericRoomReadingId?: number | null
          id?: number
          imageKey?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "GenericRoomReadingImage_GenericRoomReadingId_fkey"
            columns: ["GenericRoomReadingId"]
            isOneToOne: false
            referencedRelation: "GenericRoomReading"
            referencedColumns: ["id"]
          },
        ]
      }
      Image: {
        Row: {
          createdAt: string
          description: string | null
          id: number
          includeInReport: boolean
          isDeleted: boolean
          key: string
          organizationId: number | null
          projectId: number
          publicId: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id?: number
          includeInReport?: boolean
          isDeleted?: boolean
          key: string
          organizationId?: number | null
          projectId: number
          publicId: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: number
          includeInReport?: boolean
          isDeleted?: boolean
          key?: string
          organizationId?: number | null
          projectId?: number
          publicId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Image_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Image_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      ImageNote: {
        Row: {
          body: string
          createdAt: string
          id: number
          imageId: number
          isDeleted: boolean
          mentions: string[] | null
          updatedAt: string
          userId: string
        }
        Insert: {
          body?: string
          createdAt?: string
          id?: number
          imageId: number
          isDeleted?: boolean
          mentions?: string[] | null
          updatedAt?: string
          userId: string
        }
        Update: {
          body?: string
          createdAt?: string
          id?: number
          imageId?: number
          isDeleted?: boolean
          mentions?: string[] | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ImageNote_imageId_fkey"
            columns: ["imageId"]
            isOneToOne: false
            referencedRelation: "Image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ImageNote_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Inference: {
        Row: {
          createdAt: string
          id: number
          imageId: number | null
          imageKey: string | null
          isDeleted: boolean
          projectId: number
          publicId: string
          roomId: number | null
        }
        Insert: {
          createdAt?: string
          id?: number
          imageId?: number | null
          imageKey?: string | null
          isDeleted?: boolean
          projectId: number
          publicId: string
          roomId?: number | null
        }
        Update: {
          createdAt?: string
          id?: number
          imageId?: number | null
          imageKey?: string | null
          isDeleted?: boolean
          projectId?: number
          publicId?: string
          roomId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Inference_imageId_fkey"
            columns: ["imageId"]
            isOneToOne: false
            referencedRelation: "Image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Inference_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Inference_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "Room"
            referencedColumns: ["id"]
          },
        ]
      }
      InvoiceItems: {
        Row: {
          amount: number
          createdAt: string | null
          description: string
          id: string
          invoicePublicId: string
          isDeleted: boolean | null
          publicId: string
          quantity: number
          rate: number
          sortOrder: number | null
          updatedAt: string | null
        }
        Insert: {
          amount: number
          createdAt?: string | null
          description: string
          id?: string
          invoicePublicId: string
          isDeleted?: boolean | null
          publicId?: string
          quantity: number
          rate: number
          sortOrder?: number | null
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          createdAt?: string | null
          description?: string
          id?: string
          invoicePublicId?: string
          isDeleted?: boolean | null
          publicId?: string
          quantity?: number
          rate?: number
          sortOrder?: number | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "InvoiceItems_invoicePublicId_fkey"
            columns: ["invoicePublicId"]
            isOneToOne: false
            referencedRelation: "Invoices"
            referencedColumns: ["publicId"]
          },
        ]
      }
      Invoices: {
        Row: {
          amount: number
          clientEmail: string | null
          clientName: string
          createdAt: string | null
          daysToPay: number | null
          depositAmount: number | null
          depositPercentage: number | null
          discountAmount: number | null
          dueDate: string
          hasPaymentSchedule: boolean | null
          id: string
          invoiceDate: string | null
          isDeleted: boolean | null
          markupAmount: number | null
          markupPercentage: number | null
          notes: string | null
          number: string
          organizationPublicId: string | null
          poNumber: string | null
          projectName: string
          projectPublicId: string | null
          publicId: string
          status: Database["public"]["Enums"]["invoiceStatus"]
          subtotal: number
          taxAmount: number | null
          taxRate: number | null
          terms: string | null
          updatedAt: string | null
          userId: string
        }
        Insert: {
          amount: number
          clientEmail?: string | null
          clientName: string
          createdAt?: string | null
          daysToPay?: number | null
          depositAmount?: number | null
          depositPercentage?: number | null
          discountAmount?: number | null
          dueDate: string
          hasPaymentSchedule?: boolean | null
          id?: string
          invoiceDate?: string | null
          isDeleted?: boolean | null
          markupAmount?: number | null
          markupPercentage?: number | null
          notes?: string | null
          number: string
          organizationPublicId?: string | null
          poNumber?: string | null
          projectName: string
          projectPublicId?: string | null
          publicId?: string
          status?: Database["public"]["Enums"]["invoiceStatus"]
          subtotal: number
          taxAmount?: number | null
          taxRate?: number | null
          terms?: string | null
          updatedAt?: string | null
          userId: string
        }
        Update: {
          amount?: number
          clientEmail?: string | null
          clientName?: string
          createdAt?: string | null
          daysToPay?: number | null
          depositAmount?: number | null
          depositPercentage?: number | null
          discountAmount?: number | null
          dueDate?: string
          hasPaymentSchedule?: boolean | null
          id?: string
          invoiceDate?: string | null
          isDeleted?: boolean | null
          markupAmount?: number | null
          markupPercentage?: number | null
          notes?: string | null
          number?: string
          organizationPublicId?: string | null
          poNumber?: string | null
          projectName?: string
          projectPublicId?: string | null
          publicId?: string
          status?: Database["public"]["Enums"]["invoiceStatus"]
          subtotal?: number
          taxAmount?: number | null
          taxRate?: number | null
          terms?: string | null
          updatedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Invoices_organizationPublicId_fkey"
            columns: ["organizationPublicId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["publicId"]
          },
          {
            foreignKeyName: "Invoices_projectPublicId_fkey"
            columns: ["projectPublicId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["publicId"]
          },
        ]
      }
      ItemCategory: {
        Row: {
          hasItems: boolean
          id: number
          xactimateDescription: string
          xactimateKey: string
        }
        Insert: {
          hasItems?: boolean
          id?: number
          xactimateDescription: string
          xactimateKey: string
        }
        Update: {
          hasItems?: boolean
          id?: number
          xactimateDescription?: string
          xactimateKey?: string
        }
        Relationships: []
      }
      LineItem: {
        Row: {
          id: number
          itemCategoryId: number
          unit: string | null
          xactimateCode: string
          xactimateDescription: string
        }
        Insert: {
          id?: number
          itemCategoryId: number
          unit?: string | null
          xactimateCode: string
          xactimateDescription: string
        }
        Update: {
          id?: number
          itemCategoryId?: number
          unit?: string | null
          xactimateCode?: string
          xactimateDescription?: string
        }
        Relationships: [
          {
            foreignKeyName: "LineItem_itemCategoryId_fkey"
            columns: ["itemCategoryId"]
            isOneToOne: false
            referencedRelation: "ItemCategory"
            referencedColumns: ["id"]
          },
        ]
      }
      NoteImage: {
        Row: {
          created_at: string
          id: string
          imageKey: string | null
          noteId: number
        }
        Insert: {
          created_at?: string
          id?: string
          imageKey?: string | null
          noteId: number
        }
        Update: {
          created_at?: string
          id?: string
          imageKey?: string | null
          noteId?: number
        }
        Relationships: [
          {
            foreignKeyName: "NoteImage_noteId_fkey"
            columns: ["noteId"]
            isOneToOne: false
            referencedRelation: "Notes"
            referencedColumns: ["id"]
          },
        ]
      }
      Notes: {
        Row: {
          body: string
          createdAt: string
          date: string
          id: number
          isDeleted: boolean
          projectId: number
          publicId: string
          roomId: number
          updatedAt: string | null
        }
        Insert: {
          body?: string
          createdAt?: string
          date?: string
          id?: number
          isDeleted?: boolean
          projectId: number
          publicId: string
          roomId: number
          updatedAt?: string | null
        }
        Update: {
          body?: string
          createdAt?: string
          date?: string
          id?: number
          isDeleted?: boolean
          projectId?: number
          publicId?: string
          roomId?: number
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Notes_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Notes_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "Room"
            referencedColumns: ["id"]
          },
        ]
      }
      NotesAuditTrail: {
        Row: {
          action: Database["public"]["Enums"]["NotesAuditAction"]
          body: string
          createdAt: string
          id: number
          notesId: number
          userId: string
          userName: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["NotesAuditAction"]
          body: string
          createdAt?: string
          id?: number
          notesId: number
          userId: string
          userName?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["NotesAuditAction"]
          body?: string
          createdAt?: string
          id?: number
          notesId?: number
          userId?: string
          userName?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "NotesAuditTrail_notesId_fkey"
            columns: ["notesId"]
            isOneToOne: false
            referencedRelation: "Notes"
            referencedColumns: ["id"]
          },
        ]
      }
      Notification: {
        Row: {
          content: string
          createdAt: string
          id: number
          isDeleted: boolean
          isSeen: boolean
          link: string | null
          linkText: string | null
          publicId: string
          title: string
          type: Database["public"]["Enums"]["NotificationType"]
          userId: string
        }
        Insert: {
          content: string
          createdAt?: string
          id?: number
          isDeleted?: boolean
          isSeen: boolean
          link?: string | null
          linkText?: string | null
          publicId: string
          title: string
          type: Database["public"]["Enums"]["NotificationType"]
          userId: string
        }
        Update: {
          content?: string
          createdAt?: string
          id?: number
          isDeleted?: boolean
          isSeen?: boolean
          link?: string | null
          linkText?: string | null
          publicId?: string
          title?: string
          type?: Database["public"]["Enums"]["NotificationType"]
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Notification_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Organization: {
        Row: {
          address: string
          createdAt: string
          customerId: string | null
          faxNumber: string
          freeTrialEndsAt: string | null
          id: number
          isDeleted: boolean
          lat: number | null
          lng: number | null
          logoId: string | null
          maxUsersForSubscription: number | null
          name: string
          owner: string | null
          phoneNumber: string | null
          publicId: string
          size: string
          stripeSessionId: string | null
          subscriptionId: string | null
          subscriptionPlan:
            | Database["public"]["Enums"]["SubscriptionLevel"]
            | null
          updatedAt: string
        }
        Insert: {
          address?: string
          createdAt?: string
          customerId?: string | null
          faxNumber?: string
          freeTrialEndsAt?: string | null
          id?: number
          isDeleted?: boolean
          lat?: number | null
          lng?: number | null
          logoId?: string | null
          maxUsersForSubscription?: number | null
          name: string
          owner?: string | null
          phoneNumber?: string | null
          publicId: string
          size: string
          stripeSessionId?: string | null
          subscriptionId?: string | null
          subscriptionPlan?:
            | Database["public"]["Enums"]["SubscriptionLevel"]
            | null
          updatedAt?: string
        }
        Update: {
          address?: string
          createdAt?: string
          customerId?: string | null
          faxNumber?: string
          freeTrialEndsAt?: string | null
          id?: number
          isDeleted?: boolean
          lat?: number | null
          lng?: number | null
          logoId?: string | null
          maxUsersForSubscription?: number | null
          name?: string
          owner?: string | null
          phoneNumber?: string | null
          publicId?: string
          size?: string
          stripeSessionId?: string | null
          subscriptionId?: string | null
          subscriptionPlan?:
            | Database["public"]["Enums"]["SubscriptionLevel"]
            | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Organization_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      OrganizationInvitation: {
        Row: {
          createdAt: string
          email: string
          id: number
          invitationId: string
          isAccepted: boolean
          isDeleted: boolean
          organizationId: number
        }
        Insert: {
          createdAt?: string
          email: string
          id?: number
          invitationId: string
          isAccepted?: boolean
          isDeleted?: boolean
          organizationId: number
        }
        Update: {
          createdAt?: string
          email?: string
          id?: number
          invitationId?: string
          isAccepted?: boolean
          isDeleted?: boolean
          organizationId?: number
        }
        Relationships: [
          {
            foreignKeyName: "OrganizationInvitation_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      OrganizationSavedOption: {
        Row: {
          createdAt: string
          id: number
          isDeleted: boolean
          label: string
          organizationId: number
          publicId: string
          type: Database["public"]["Enums"]["SavedOptionType"]
          value: string
        }
        Insert: {
          createdAt?: string
          id?: number
          isDeleted?: boolean
          label: string
          organizationId: number
          publicId: string
          type: Database["public"]["Enums"]["SavedOptionType"]
          value: string
        }
        Update: {
          createdAt?: string
          id?: number
          isDeleted?: boolean
          label?: string
          organizationId?: number
          publicId?: string
          type?: Database["public"]["Enums"]["SavedOptionType"]
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "OrganizationSavedOption_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      PaymentSchedules: {
        Row: {
          amount: number
          createdAt: string | null
          description: string | null
          dueDate: string
          id: string
          invoicePublicId: string
          isDeleted: boolean | null
          isPaid: boolean | null
          paidDate: string | null
          publicId: string
          updatedAt: string | null
        }
        Insert: {
          amount: number
          createdAt?: string | null
          description?: string | null
          dueDate: string
          id?: string
          invoicePublicId: string
          isDeleted?: boolean | null
          isPaid?: boolean | null
          paidDate?: string | null
          publicId?: string
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          createdAt?: string | null
          description?: string | null
          dueDate?: string
          id?: string
          invoicePublicId?: string
          isDeleted?: boolean | null
          isPaid?: boolean | null
          paidDate?: string | null
          publicId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "PaymentSchedules_invoicePublicId_fkey"
            columns: ["invoicePublicId"]
            isOneToOne: false
            referencedRelation: "Invoices"
            referencedColumns: ["publicId"]
          },
        ]
      }
      PendingRoofReports: {
        Row: {
          createdAt: string
          id: number
          isCompleted: boolean
          isDeleted: boolean
          projectId: number
        }
        Insert: {
          createdAt?: string
          id?: number
          isCompleted?: boolean
          isDeleted?: boolean
          projectId: number
        }
        Update: {
          createdAt?: string
          id?: number
          isCompleted?: boolean
          isDeleted?: boolean
          projectId?: number
        }
        Relationships: [
          {
            foreignKeyName: "PendingRoofReports_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      PhotoAccessLink: {
        Row: {
          accessId: string
          createdAt: string
          email: string | null
          expiresAt: string | null
          id: number
          phoneNumber: string | null
          projectId: number
        }
        Insert: {
          accessId: string
          createdAt?: string
          email?: string | null
          expiresAt?: string | null
          id?: number
          phoneNumber?: string | null
          projectId: number
        }
        Update: {
          accessId?: string
          createdAt?: string
          email?: string | null
          expiresAt?: string | null
          id?: number
          phoneNumber?: string | null
          projectId?: number
        }
        Relationships: [
          {
            foreignKeyName: "PhotoAccessLink_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      PlanEntitlements: {
        Row: {
          createdAt: string
          description: string
          extPlanId: string
          id: number
          maxImages: number
          maxProjects: number
          maxSeats: number
          period: string
          price: number
        }
        Insert: {
          createdAt?: string
          description: string
          extPlanId: string
          id?: number
          maxImages: number
          maxProjects: number
          maxSeats: number
          period: string
          price: number
        }
        Update: {
          createdAt?: string
          description?: string
          extPlanId?: string
          id?: number
          maxImages?: number
          maxProjects?: number
          maxSeats?: number
          period?: string
          price?: number
        }
        Relationships: []
      }
      Prices: {
        Row: {
          active: boolean
          currency: string
          description: string
          id: string
          interval: Database["public"]["Enums"]["PricingPlanInterval"] | null
          intervalCount: number | null
          metadata: Json | null
          productId: string
          trialPeriodDays: number | null
          type: Database["public"]["Enums"]["PricingType"]
          unitAmount: number | null
        }
        Insert: {
          active: boolean
          currency: string
          description: string
          id: string
          interval?: Database["public"]["Enums"]["PricingPlanInterval"] | null
          intervalCount?: number | null
          metadata?: Json | null
          productId: string
          trialPeriodDays?: number | null
          type: Database["public"]["Enums"]["PricingType"]
          unitAmount?: number | null
        }
        Update: {
          active?: boolean
          currency?: string
          description?: string
          id?: string
          interval?: Database["public"]["Enums"]["PricingPlanInterval"] | null
          intervalCount?: number | null
          metadata?: Json | null
          productId?: string
          trialPeriodDays?: number | null
          type?: Database["public"]["Enums"]["PricingType"]
          unitAmount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Prices_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Products"
            referencedColumns: ["id"]
          },
        ]
      }
      Products: {
        Row: {
          active: boolean
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string
        }
        Insert: {
          active: boolean
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name: string
        }
        Update: {
          active?: boolean
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string
        }
        Relationships: []
      }
      Project: {
        Row: {
          actualValue: number | null
          adjusterEmail: string
          adjusterName: string
          adjusterPhoneNumber: string
          assignmentNumber: string
          catCode: number | null
          claimSummary: string
          clientEmail: string
          clientName: string
          clientPhoneNumber: string
          closedAt: string | null
          companyName: string
          createdAt: string
          damageType: string | null
          forecast: string
          humidity: string
          id: number
          insuranceClaimId: string
          insuranceCompanyName: string
          isDeleted: boolean
          lastTimeWeatherFetched: string | null
          lat: string
          lng: string
          location: string
          lossType: string
          managerName: string
          name: string
          organizationId: number
          projectStatusValueId: number | null
          publicId: string
          rcvValue: number | null
          roofSegments: Json[] | null
          roofSpecs: Json | null
          status: string | null
          temperature: string
          wind: string
        }
        Insert: {
          actualValue?: number | null
          adjusterEmail?: string
          adjusterName?: string
          adjusterPhoneNumber?: string
          assignmentNumber?: string
          catCode?: number | null
          claimSummary?: string
          clientEmail?: string
          clientName?: string
          clientPhoneNumber?: string
          closedAt?: string | null
          companyName?: string
          createdAt?: string
          damageType?: string | null
          forecast?: string
          humidity?: string
          id?: number
          insuranceClaimId?: string
          insuranceCompanyName?: string
          isDeleted?: boolean
          lastTimeWeatherFetched?: string | null
          lat?: string
          lng?: string
          location?: string
          lossType?: string
          managerName?: string
          name: string
          organizationId: number
          projectStatusValueId?: number | null
          publicId: string
          rcvValue?: number | null
          roofSegments?: Json[] | null
          roofSpecs?: Json | null
          status?: string | null
          temperature?: string
          wind?: string
        }
        Update: {
          actualValue?: number | null
          adjusterEmail?: string
          adjusterName?: string
          adjusterPhoneNumber?: string
          assignmentNumber?: string
          catCode?: number | null
          claimSummary?: string
          clientEmail?: string
          clientName?: string
          clientPhoneNumber?: string
          closedAt?: string | null
          companyName?: string
          createdAt?: string
          damageType?: string | null
          forecast?: string
          humidity?: string
          id?: number
          insuranceClaimId?: string
          insuranceCompanyName?: string
          isDeleted?: boolean
          lastTimeWeatherFetched?: string | null
          lat?: string
          lng?: string
          location?: string
          lossType?: string
          managerName?: string
          name?: string
          organizationId?: number
          projectStatusValueId?: number | null
          publicId?: string
          rcvValue?: number | null
          roofSegments?: Json[] | null
          roofSpecs?: Json | null
          status?: string | null
          temperature?: string
          wind?: string
        }
        Relationships: [
          {
            foreignKeyName: "Project_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Project_projectStatusValueId_fkey"
            columns: ["projectStatusValueId"]
            isOneToOne: false
            referencedRelation: "ProjectStatusValue"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectEquipment: {
        Row: {
          createdAt: string
          equipmentId: number
          id: number
          isDeleted: boolean
          projectId: number
          publicId: string
          quantity: number
        }
        Insert: {
          createdAt?: string
          equipmentId: number
          id?: number
          isDeleted?: boolean
          projectId: number
          publicId: string
          quantity?: number
        }
        Update: {
          createdAt?: string
          equipmentId?: number
          id?: number
          isDeleted?: boolean
          projectId?: number
          publicId?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "ProjectEquipment_equipmentId_fkey"
            columns: ["equipmentId"]
            isOneToOne: false
            referencedRelation: "Equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ProjectEquipment_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectNotes: {
        Row: {
          body: string
          createdAt: string
          date: string
          id: number
          isDeleted: boolean
          mentions: string[] | null
          projectId: number
          publicId: string
          updatedAt: string | null
          userId: string
        }
        Insert: {
          body?: string
          createdAt?: string
          date?: string
          id?: number
          isDeleted?: boolean
          mentions?: string[] | null
          projectId: number
          publicId: string
          updatedAt?: string | null
          userId: string
        }
        Update: {
          body?: string
          createdAt?: string
          date?: string
          id?: number
          isDeleted?: boolean
          mentions?: string[] | null
          projectId?: number
          publicId?: string
          updatedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProjectNotes_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectStatusValue: {
        Row: {
          color: string
          createdAt: string
          description: string
          id: number
          isDeleted: boolean
          label: string
          order: number | null
          organizationId: number
          publicId: string
        }
        Insert: {
          color: string
          createdAt?: string
          description: string
          id?: number
          isDeleted?: boolean
          label: string
          order?: number | null
          organizationId: number
          publicId: string
        }
        Update: {
          color?: string
          createdAt?: string
          description?: string
          id?: number
          isDeleted?: boolean
          label?: string
          order?: number | null
          organizationId?: number
          publicId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProjectStatusValue_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      PropertyData: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          createdAt: string
          data: Json | null
          id: number
          projectId: number | null
          realtyMoleId: string | null
          squareFootage: number | null
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          createdAt?: string
          data?: Json | null
          id?: number
          projectId?: number | null
          realtyMoleId?: string | null
          squareFootage?: number | null
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          createdAt?: string
          data?: Json | null
          id?: number
          projectId?: number | null
          realtyMoleId?: string | null
          squareFootage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "PropertyData_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      RekognitionRuns: {
        Row: {
          createdAt: string
          id: number
        }
        Insert: {
          createdAt?: string
          id?: number
        }
        Update: {
          createdAt?: string
          id?: number
        }
        Relationships: []
      }
      RelatedItem: {
        Row: {
          id: number
          lineItemId: number
          relationId: string
        }
        Insert: {
          id?: number
          lineItemId: number
          relationId: string
        }
        Update: {
          id?: number
          lineItemId?: number
          relationId?: string
        }
        Relationships: [
          {
            foreignKeyName: "RelatedItem_lineItemId_fkey"
            columns: ["lineItemId"]
            isOneToOne: false
            referencedRelation: "LineItem"
            referencedColumns: ["id"]
          },
        ]
      }
      Room: {
        Row: {
          createdAt: string
          cubiModelId: string | null
          cubiRoomPlan: string | null
          cubiTicketId: string | null
          dehuReading: string | null
          doors: number | null
          equipmentUsed: string[] | null
          extendedWalls: Json | null
          floorName: string | null
          gpp: string | null
          height: string | null
          humidity: string | null
          id: number
          isDeleted: boolean
          length: string | null
          name: string
          projectId: number
          publicId: string
          roomPlanSVG: string | null
          scannedFileKey: string | null
          temperature: string | null
          totalSqft: string | null
          wallName: string | null
          width: string | null
          windows: number | null
        }
        Insert: {
          createdAt?: string
          cubiModelId?: string | null
          cubiRoomPlan?: string | null
          cubiTicketId?: string | null
          dehuReading?: string | null
          doors?: number | null
          equipmentUsed?: string[] | null
          extendedWalls?: Json | null
          floorName?: string | null
          gpp?: string | null
          height?: string | null
          humidity?: string | null
          id?: number
          isDeleted?: boolean
          length?: string | null
          name: string
          projectId: number
          publicId: string
          roomPlanSVG?: string | null
          scannedFileKey?: string | null
          temperature?: string | null
          totalSqft?: string | null
          wallName?: string | null
          width?: string | null
          windows?: number | null
        }
        Update: {
          createdAt?: string
          cubiModelId?: string | null
          cubiRoomPlan?: string | null
          cubiTicketId?: string | null
          dehuReading?: string | null
          doors?: number | null
          equipmentUsed?: string[] | null
          extendedWalls?: Json | null
          floorName?: string | null
          gpp?: string | null
          height?: string | null
          humidity?: string | null
          id?: number
          isDeleted?: boolean
          length?: string | null
          name?: string
          projectId?: number
          publicId?: string
          roomPlanSVG?: string | null
          scannedFileKey?: string | null
          temperature?: string | null
          totalSqft?: string | null
          wallName?: string | null
          width?: string | null
          windows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Room_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      RoomReading: {
        Row: {
          createdAt: string
          date: string
          equipmentUsed: string[] | null
          extendedWalls: Json | null
          floorName: string | null
          gpp: string | null
          humidity: string | null
          id: number
          isDeleted: boolean
          moistureContentFloor: string | null
          moistureContentWall: string | null
          projectId: number
          publicId: string
          roomId: number
          temperature: string | null
          wallName: string | null
        }
        Insert: {
          createdAt?: string
          date?: string
          equipmentUsed?: string[] | null
          extendedWalls?: Json | null
          floorName?: string | null
          gpp?: string | null
          humidity?: string | null
          id?: number
          isDeleted?: boolean
          moistureContentFloor?: string | null
          moistureContentWall?: string | null
          projectId: number
          publicId: string
          roomId: number
          temperature?: string | null
          wallName?: string | null
        }
        Update: {
          createdAt?: string
          date?: string
          equipmentUsed?: string[] | null
          extendedWalls?: Json | null
          floorName?: string | null
          gpp?: string | null
          humidity?: string | null
          id?: number
          isDeleted?: boolean
          moistureContentFloor?: string | null
          moistureContentWall?: string | null
          projectId?: number
          publicId?: string
          roomId?: number
          temperature?: string | null
          wallName?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "RoomReading_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "RoomReading_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "Room"
            referencedColumns: ["id"]
          },
        ]
      }
      RoomReadingImage: {
        Row: {
          created_at: string
          id: number
          imageKey: string | null
          RoomReadingId: number | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          imageKey?: string | null
          RoomReadingId?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          imageKey?: string | null
          RoomReadingId?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "RoomReadingImage_RoomReadingId_fkey"
            columns: ["RoomReadingId"]
            isOneToOne: false
            referencedRelation: "RoomReading"
            referencedColumns: ["id"]
          },
        ]
      }
      SavedLineItems: {
        Row: {
          category: string | null
          createdAt: string | null
          description: string
          id: string
          isDeleted: boolean | null
          organizationId: string
          publicId: string
          rate: number
          updatedAt: string | null
          userId: string
        }
        Insert: {
          category?: string | null
          createdAt?: string | null
          description: string
          id?: string
          isDeleted?: boolean | null
          organizationId: string
          publicId?: string
          rate?: number
          updatedAt?: string | null
          userId: string
        }
        Update: {
          category?: string | null
          createdAt?: string | null
          description?: string
          id?: string
          isDeleted?: boolean | null
          organizationId?: string
          publicId?: string
          rate?: number
          updatedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "SavedLineItems_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["publicId"]
          },
        ]
      }
      Signature: {
        Row: {
          created_at: string
          id: number
          name: string | null
          orgId: number | null
          sign: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          orgId?: number | null
          sign?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          orgId?: number | null
          sign?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Signature_orgId_fkey"
            columns: ["orgId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      Subscriptions: {
        Row: {
          cancelAt: string | null
          cancelAtPeriodEnd: boolean
          canceledAt: string | null
          created: string | null
          currentPeriodEnd: string | null
          currentPeriodStart: string | null
          endedAt: string | null
          id: string
          metadata: Json | null
          organizationId: number
          pricesId: string
          quantity: number
          status: Database["public"]["Enums"]["SubscriptionStatus"]
          trialEnd: string | null
          trialStart: string | null
        }
        Insert: {
          cancelAt?: string | null
          cancelAtPeriodEnd: boolean
          canceledAt?: string | null
          created?: string | null
          currentPeriodEnd?: string | null
          currentPeriodStart?: string | null
          endedAt?: string | null
          id: string
          metadata?: Json | null
          organizationId: number
          pricesId: string
          quantity: number
          status: Database["public"]["Enums"]["SubscriptionStatus"]
          trialEnd?: string | null
          trialStart?: string | null
        }
        Update: {
          cancelAt?: string | null
          cancelAtPeriodEnd?: boolean
          canceledAt?: string | null
          created?: string | null
          currentPeriodEnd?: string | null
          currentPeriodStart?: string | null
          endedAt?: string | null
          id?: string
          metadata?: Json | null
          organizationId?: number
          pricesId?: string
          quantity?: number
          status?: Database["public"]["Enums"]["SubscriptionStatus"]
          trialEnd?: string | null
          trialStart?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Subscriptions_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subscriptions_pricesId_fkey"
            columns: ["pricesId"]
            isOneToOne: false
            referencedRelation: "Prices"
            referencedColumns: ["id"]
          },
        ]
      }
      TemplatesUsed: {
        Row: {
          createdAt: string
          id: number
          roomId: number | null
          templateCode: string
        }
        Insert: {
          createdAt?: string
          id?: number
          roomId?: number | null
          templateCode: string
        }
        Update: {
          createdAt?: string
          id?: number
          roomId?: number | null
          templateCode?: string
        }
        Relationships: [
          {
            foreignKeyName: "TemplatesUsed_roomId_fkey"
            columns: ["roomId"]
            isOneToOne: false
            referencedRelation: "Room"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          accessLevel: Database["public"]["Enums"]["AccessLevel"] | null
          createdAt: string
          email: string
          firstName: string
          groupView: Database["public"]["Enums"]["GroupByViews"]
          hasSeenProductTour: boolean
          id: string
          inviteId: string | null
          isDeleted: boolean
          isSupportUser: boolean
          lastName: string
          onboardingStatus: Json | null
          organizationId: string | null
          phone: string
          photoView: Database["public"]["Enums"]["PhotoViews"]
          productTourData: Json | null
          removed: boolean
          savedDashboardView: Database["public"]["Enums"]["DashboardViews"]
          token: string | null
          updatedAt: string
        }
        Insert: {
          accessLevel?: Database["public"]["Enums"]["AccessLevel"] | null
          createdAt?: string
          email: string
          firstName?: string
          groupView?: Database["public"]["Enums"]["GroupByViews"]
          hasSeenProductTour?: boolean
          id: string
          inviteId?: string | null
          isDeleted?: boolean
          isSupportUser?: boolean
          lastName?: string
          onboardingStatus?: Json | null
          organizationId?: string | null
          phone?: string
          photoView?: Database["public"]["Enums"]["PhotoViews"]
          productTourData?: Json | null
          removed?: boolean
          savedDashboardView?: Database["public"]["Enums"]["DashboardViews"]
          token?: string | null
          updatedAt?: string
        }
        Update: {
          accessLevel?: Database["public"]["Enums"]["AccessLevel"] | null
          createdAt?: string
          email?: string
          firstName?: string
          groupView?: Database["public"]["Enums"]["GroupByViews"]
          hasSeenProductTour?: boolean
          id?: string
          inviteId?: string | null
          isDeleted?: boolean
          isSupportUser?: boolean
          lastName?: string
          onboardingStatus?: Json | null
          organizationId?: string | null
          phone?: string
          photoView?: Database["public"]["Enums"]["PhotoViews"]
          productTourData?: Json | null
          removed?: boolean
          savedDashboardView?: Database["public"]["Enums"]["DashboardViews"]
          token?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "User_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["publicId"]
          },
        ]
      }
      UserToOrganization: {
        Row: {
          accessLevel: Database["public"]["Enums"]["AccessLevel"] | null
          createdAt: string
          id: number
          isAdmin: boolean
          isDeleted: boolean
          organizationId: number
          role: string | null
          userId: string
        }
        Insert: {
          accessLevel?: Database["public"]["Enums"]["AccessLevel"] | null
          createdAt?: string
          id?: number
          isAdmin?: boolean
          isDeleted?: boolean
          organizationId: number
          role?: string | null
          userId: string
        }
        Update: {
          accessLevel?: Database["public"]["Enums"]["AccessLevel"] | null
          createdAt?: string
          id?: number
          isAdmin?: boolean
          isDeleted?: boolean
          organizationId?: number
          role?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserToOrganization_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserToOrganization_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      UserToProject: {
        Row: {
          createdAt: string
          id: number
          projectId: number
          userId: string
        }
        Insert: {
          createdAt?: string
          id?: number
          projectId: number
          userId: string
        }
        Update: {
          createdAt?: string
          id?: number
          projectId?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserToProject_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserToProject_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      WaitList: {
        Row: {
          createdAt: string
          email: string
          id: number
        }
        Insert: {
          createdAt?: string
          email: string
          id?: number
        }
        Update: {
          createdAt?: string
          email?: string
          id?: number
        }
        Relationships: []
      }
      WeatherReportItem: {
        Row: {
          comments: string
          county: string
          createdAt: string
          date: string
          f_scale: string | null
          id: number
          isDeleted: boolean
          lat: string
          location: string
          lon: string
          projectId: number
          size: string | null
          speed: string | null
          state: string
          time: string
        }
        Insert: {
          comments: string
          county: string
          createdAt?: string
          date: string
          f_scale?: string | null
          id?: number
          isDeleted?: boolean
          lat: string
          location: string
          lon: string
          projectId: number
          size?: string | null
          speed?: string | null
          state: string
          time: string
        }
        Update: {
          comments?: string
          county?: string
          createdAt?: string
          date?: string
          f_scale?: string | null
          id?: number
          isDeleted?: boolean
          lat?: string
          location?: string
          lon?: string
          projectId?: number
          size?: string | null
          speed?: string | null
          state?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "WeatherReportItem_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      urlencode: {
        Args: { string: string } | { string: string } | { data: Json }
        Returns: string
      }
    }
    Enums: {
      AccessLevel:
        | "admin"
        | "viewer"
        | "projectManager"
        | "accountManager"
        | "contractor"
        | "owner"
      AreaAffectedType: "wall" | "ceiling" | "floor"
      CostType: "subcontractor" | "miscellaneous" | "materials" | "labor"
      DashboardViews: "listView" | "boardView" | "mapView"
      DimensionUnit: "sf" | "lf" | "ea"
      EqiupmentType: "fan" | "dehumidifier" | "airScrubber"
      estimateStatus:
        | "draft"
        | "sent"
        | "approved"
        | "rejected"
        | "cancelled"
        | "expired"
      GroupByViews: "roomView" | "dateView"
      invoiceStatus: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      NotesAuditAction: "updated" | "deleted" | "created"
      NotificationType: "notification" | "activity"
      PhotoViews: "photoListView" | "photoGridView"
      PricingPlanInterval: "day" | "week" | "month" | "year"
      PricingType: "one_time" | "recurring"
      ProjectStatus:
        | "active"
        | "mitigation"
        | "inspection"
        | "review"
        | "completed"
        | "inactive"
        | "incomplete"
      ReminderTarget: "client" | "allAssigned" | "projectCreator"
      RoomReadingType: "dehumidifer"
      SavedOptionType: "carrier" | "wallMaterial" | "floorMaterial"
      SubscriptionLevel: "early_bird" | "startup" | "team" | "enterprise"
      SubscriptionStatus:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      AccessLevel: [
        "admin",
        "viewer",
        "projectManager",
        "accountManager",
        "contractor",
        "owner",
      ],
      AreaAffectedType: ["wall", "ceiling", "floor"],
      CostType: ["subcontractor", "miscellaneous", "materials", "labor"],
      DashboardViews: ["listView", "boardView", "mapView"],
      DimensionUnit: ["sf", "lf", "ea"],
      EqiupmentType: ["fan", "dehumidifier", "airScrubber"],
      estimateStatus: [
        "draft",
        "sent",
        "approved",
        "rejected",
        "cancelled",
        "expired",
      ],
      GroupByViews: ["roomView", "dateView"],
      invoiceStatus: ["draft", "sent", "paid", "overdue", "cancelled"],
      NotesAuditAction: ["updated", "deleted", "created"],
      NotificationType: ["notification", "activity"],
      PhotoViews: ["photoListView", "photoGridView"],
      PricingPlanInterval: ["day", "week", "month", "year"],
      PricingType: ["one_time", "recurring"],
      ProjectStatus: [
        "active",
        "mitigation",
        "inspection",
        "review",
        "completed",
        "inactive",
        "incomplete",
      ],
      ReminderTarget: ["client", "allAssigned", "projectCreator"],
      RoomReadingType: ["dehumidifer"],
      SavedOptionType: ["carrier", "wallMaterial", "floorMaterial"],
      SubscriptionLevel: ["early_bird", "startup", "team", "enterprise"],
      SubscriptionStatus: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
      ],
    },
  },
} as const
