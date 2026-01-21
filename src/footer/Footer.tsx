import React, { useState } from "react";
import ButtonWrapper from "../common-components/ButtonWrapper";
import BugReportDialog from "../bug-report/BugReportDialog";
import "./Footer.css";

const Footer: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <footer className="site-footer">
        <ButtonWrapper
          onClick={() => setIsDialogOpen(true)}
          className="bug-report-button"
        >
          Report a Bug
        </ButtonWrapper>
      </footer>

      <BugReportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};

export default Footer;
