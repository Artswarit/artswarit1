
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const RequestProjectModal = ({
  isOpen,
  onClose,
  artist,
}: {
  isOpen: boolean;
  onClose: () => void;
  artist: any;
}) => {
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails("");
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Project</DialogTitle>
          <DialogDescription>
            Send a commission/project request to <b>{artist?.name}</b>
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <div className="text-green-700 font-medium text-center py-8">Project request sent!</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              required
              placeholder="Describe your project idea (150 chars max)"
              maxLength={150}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400"
              style={{ minHeight: "80px" }}
            />
            <DialogFooter>
              <Button disabled={!details.trim() || submitted} type="submit">
                Send Request
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" type="button">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestProjectModal;
