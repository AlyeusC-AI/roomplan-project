import { Button } from "@components/ui/button";
import { Sheet, SheetContent } from "@components/ui/sheet";
import { Separator } from "@components/ui/separator";
import { Badge } from "@components/ui/badge";
import { format } from "date-fns";
import { cn } from "@lib/utils";
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  PlayCircle,
  CheckCircle,
  MapPin as MapPinIcon,
  User,
  DollarSign,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrivalNotification } from "./notifications/arrival";
import { StartWorkNotification } from "./notifications/start-work";
import { CompleteWorkNotification } from "./notifications/complete-work";
import { useState } from "react";

type EventDetailsSheetProps = {
  event: CalendarEvent | null;
  projectDetails: any;
  mapImageUrl: string | null;
  onClose: () => void;
  onEdit: () => void;
    onDelete: () => void;
  isLoading: boolean;
};

export function EventDetailsSheet({
  event,
  projectDetails,
  mapImageUrl,
  onClose,
  onEdit,
  onDelete,
  isLoading,
}: EventDetailsSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showArrivalNotification, setShowArrivalNotification] = useState(false);
  const [showStartWorkNotification, setShowStartWorkNotification] = useState(false);
  const [showCompleteWorkNotification, setShowCompleteWorkNotification] = useState(false);

  if (!event) return null;

  const handleNotificationClick = (type: 'arrival' | 'start' | 'complete') => {
    switch (type) {
      case 'arrival':
        setShowArrivalNotification(true);
        break;
      case 'start':
        setShowStartWorkNotification(true);
        break;
      case 'complete':
        setShowCompleteWorkNotification(true);
        break;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      <Sheet open={!!event} onOpenChange={onClose}>
        <SheetContent className="w-[600px] overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{event.subject}</h2>
                <p className="text-muted-foreground">{event.payload}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              projectDetails ? (
                <div className="space-y-4">
                  <div>
                  <h3 className="text-lg font-semibold">{projectDetails.clientName}</h3>
                  <Link href={`/projects/${projectDetails.id}`}>
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <span>View project details</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  </Link>
                </div>

                <div className="space-y-2">
                  {projectDetails.clientEmail && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-600">{projectDetails.clientEmail}</span>
                    </div>
                  )}
                  {projectDetails.clientPhoneNumber && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-600">{projectDetails.clientPhoneNumber}</span>
                    </div>
                  )}
                  {projectDetails.companyName && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-500">{projectDetails.companyName}</span>
                    </div>
                  )}
                  {projectDetails.insuranceCompanyName && (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-500">
                        {projectDetails.insuranceCompanyName}
                        {projectDetails.insuranceClaimId
                          ? ` • Claim #${projectDetails.insuranceClaimId}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>

                {projectDetails.location && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-500">Project Location:</span>
                    </div>
                    <p className="ml-6 text-gray-500">{projectDetails.location}</p>
                    {mapImageUrl && (
                      <div className="relative h-[150px] w-full overflow-hidden rounded-lg">
                        <img
                          src={mapImageUrl}
                          alt="Location map"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold">Project Details:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge className={cn("ml-2", getStatusColor(projectDetails.status))}>
                        {projectDetails.status}
                      </Badge>
                    </div>
                    {projectDetails.lossType && (
                      <div>
                        <span className="text-sm text-gray-500">Loss Type:</span>
                        <p className="mt-1">{projectDetails.lossType}</p>
                      </div>
                    )}
                    {projectDetails.rcvValue && (
                      <div>
                        <span className="text-sm text-gray-500">RCV Value:</span>
                        <p className="mt-1">${projectDetails.rcvValue.toLocaleString()}</p>
                      </div>
                    )}
                    {projectDetails.actualValue && (
                      <div>
                        <span className="text-sm text-gray-500">Actual Value:</span>
                        <p className="mt-1">${projectDetails.actualValue.toLocaleString()}</p>
                      </div>
                    )}
                    {projectDetails.managerName && (
                      <div>
                        <span className="text-sm text-gray-500">Project Manager:</span>
                        <p className="mt-1">{projectDetails.managerName}</p>
                      </div>
                    )}
                    {projectDetails.adjusterName && (
                      <div>
                        <span className="text-sm text-gray-500">Adjuster:</span>
                        <p className="mt-1">{projectDetails.adjusterName}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Insurance Details:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {projectDetails.adjusterEmail && (
                      <div>
                        <span className="text-sm text-gray-500">Adjuster Email:</span>
                        <p className="mt-1">{projectDetails.adjusterEmail}</p>
                      </div>
                    )}
                    {projectDetails.adjusterPhoneNumber && (
                      <div>
                        <span className="text-sm text-gray-500">Adjuster Phone:</span>
                        <p className="mt-1">{projectDetails.adjusterPhoneNumber}</p>
                      </div>
                    )}
                    {projectDetails.catCode && (
                      <div>
                        <span className="text-sm text-gray-500">CAT Code:</span>
                        <p className="mt-1">{projectDetails.catCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>No project details found</p>
                </div>
              )
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-500">
                  {format(new Date(event.start ?? event.date), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-500">
                  {format(new Date(event.start ?? event.date), "h:mm a")}
                  {event.end &&
                    ` - ${format(new Date(event.end), "h:mm a")}`}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                className="flex-1 bg-indigo-700 hover:bg-indigo-800"
                onClick={() => handleNotificationClick('arrival')}
              >
                <MapPinIcon className="mr-2 h-4 w-4" />
                Arrival
              </Button>
              <Button
                className="flex-1 bg-cyan-700 hover:bg-cyan-800"
                onClick={() => handleNotificationClick('start')}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Start
              </Button>
              <Button
                className="flex-1 bg-green-700 hover:bg-green-800"
                onClick={() => handleNotificationClick('complete')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {showArrivalNotification && (
        <ArrivalNotification
         onClose={() => setShowArrivalNotification(false)}
         project={projectDetails}
         event={event}
        />
      )}
      {showStartWorkNotification && (
        <StartWorkNotification 
        project={projectDetails}
        event={event}
        onClose={() => setShowStartWorkNotification(false)} />
      )}
      {showCompleteWorkNotification && (
        <CompleteWorkNotification 
        project={projectDetails}
        event={event}
        onClose={() => setShowCompleteWorkNotification(false)}
        />
      )}
    </>
  );
} 