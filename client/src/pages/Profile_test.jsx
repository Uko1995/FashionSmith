import React from "react";

export default function Profile() {
  console.log("Profile component is rendering");

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Profile Page</h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Test Profile Component</h2>
            <p>
              This is a minimal test to verify the component renders correctly.
            </p>
            <div className="alert alert-info">
              <span>If you can see this, the component is working!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
