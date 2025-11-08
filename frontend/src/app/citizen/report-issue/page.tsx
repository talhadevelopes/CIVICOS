"use client"

import { useState, useEffect } from "react"
import { Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { useUserDetails } from "@/lib/cache/index"

export default function ReportIssue() {
  const [email, setEmail] = useState<string>("")
  const { data: user, isLoading: isLoadingUser } = useUserDetails(email)

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    severity: "LOW" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState("")
  const [uploadedImageUrl, setUploadedImageUrl] = useState("")
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const storedEmail = localStorage.getItem("email")
    if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  const categories = ["Road Damage", "Pothole", "Street Light", "Water Supply", "Drainage", "Garbage", "Traffic", "Other"]
  const severityLevels = [
    { value: "LOW", label: "Low", color: "text-[#10b981]" },
    { value: "MEDIUM", label: "Medium", color: "text-[#eab308]" },
    { value: "HIGH", label: "High", color: "text-[#f97316]" },
    { value: "CRITICAL", label: "Critical", color: "text-[#ef4444]" },
  ]

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    setLocationError("")
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setIsLoadingLocation(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoordinates({ latitude, longitude })
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await response.json()
          const address = data.display_name || `${latitude}, ${longitude}`
          setFormData(prev => ({ ...prev, location: address }))
        } catch (error) {
          setFormData(prev => ({ ...prev, location: `${latitude}, ${longitude}` }))
        }
        setIsLoadingLocation(false)
      },
      (error) => {
        setLocationError("Unable to get location. Please enter manually.")
        setIsLoadingLocation(false)
      }
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true)
    setUploadError("")
    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      formDataObj.append('upload_preset', 'ml_default')
      formDataObj.append('api_key', '293268566572153')
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dvmnmpdyy/image/upload`,
        {
          method: 'POST',
          body: formDataObj
        }
      )
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      const data = await response.json()
      setUploadedImageUrl(data.secure_url)
      return data.secure_url
    } catch (error) {
      setUploadError('Failed to upload image. Please try again.')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      await uploadToCloudinary(file)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setUploadError("")
    try {
      const citizenId = localStorage.getItem("id")
      if (!citizenId) {
        setUploadError("User not authenticated. Please login again.")
        setIsSubmitting(false)
        return
      }
      const mlaId = user?.currentMLA?.id || user?.mlaId
      const issueData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        severity: formData.severity,
        citizenId: citizenId,
        ...(mlaId && { mlaId: mlaId }),
        ...(uploadedImageUrl && { mediaUrl: uploadedImageUrl }),
        ...(coordinates?.latitude && { latitude: coordinates.latitude }),
        ...(coordinates?.longitude && { longitude: coordinates.longitude }),
      }
      const response = await fetch("https://civiciobackend.vercel.app/api/v1/citizen/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issueData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit issue")
      }
      setSubmitted(true)
      setTimeout(() => {
        window.location.href = "/citizen/dashboard"
      }, 2000)
    } catch (error: any) {
      setUploadError(error.message || "An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (isLoadingUser || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background:'#0a0a0a'}}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin" style={{color:'#3b82f6',margin:'0 auto 1rem'}} />
          <p style={{color:'#a1a1aa'}}>Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 mt-12" style={{background:'#0a0a0a',color:'#fff'}}>
      <div className="max-w-2xl mx-auto">
        <div>
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2" style={{color:'#fff'}}>Report an Issue</h1>
            <p style={{color:'#a1a1aa'}}>Help improve your city by reporting civic issues</p>
            {user?.currentMLA && (
              <p className="text-sm mt-2" style={{color:'#3b82f6'}}>
                📍 Your MLA: {user.currentMLA.name} ({user.constituency})
              </p>
            )}
          </div>

          {submitted ? (
            <div className="border-2 rounded-lg p-8 text-center" style={{background:'#18181b',borderColor:'#10b981'}}>
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{color:'#10b981'}} />
              <h2 className="text-2xl font-bold mb-2" style={{color:'#10b981'}}>Issue Reported Successfully</h2>
              <p className="mb-4" style={{color:'#22d3ee'}}>
                Your report has been submitted to {user?.currentMLA?.name || "your MLA"}. Authorities will review and take action soon.
              </p>
              {uploadedImageUrl && (
                <div className="rounded p-3 mb-4" style={{background:'#23232b'}}>
                  <p className="text-sm mb-1 font-medium" style={{color:'#a1a1aa'}}>Image URL:</p>
                  <p className="text-xs" style={{color:'#3b82f6',wordBreak:'break-all'}}>{uploadedImageUrl}</p>
                </div>
              )}
              <p className="text-sm" style={{color:'#22d3ee'}}>Redirecting to dashboard...</p>
            </div>
          ) : (
            <div className="rounded-lg shadow-lg p-8 space-y-6" style={{background:'#18181b',border:'1px solid #27272a'}}>
              {/* Issue Title */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color:'#d4d4d8'}}>Issue Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Brief title of the issue"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-[#23232b] border border-[#27272a] text-white focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-base"
                  style={{transition:'all .15s'}}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color:'#d4d4d8'}}>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-[#23232b] border border-[#27272a] text-white focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-base"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color:'#d4d4d8'}}>Location *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter address or use auto-detect"
                    required
                    className="flex-1 px-4 py-2 rounded-lg bg-[#23232b] border border-[#27272a] text-white focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-base"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {isLoadingLocation ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Auto-detect
                      </>
                    )}
                  </button>
                </div>
                {locationError && (
                  <p className="text-xs mt-1" style={{color:'#fde68a'}}>{locationError}</p>
                )}
                {coordinates && (
                  <p className="text-xs mt-1" style={{color:'#10b981'}}>
                    📍 Coordinates captured: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color:'#d4d4d8'}}>Severity *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {severityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, severity: level.value as any }))}
                      className={
                        `px-4 py-2 rounded-lg border-2 font-medium transition ` +
                        (formData.severity === level.value
                          ? `${level.color} border-current bg-[#23232b] bg-opacity-15`
                          : 'border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#52525b]')
                      }
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color:'#d4d4d8'}}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the issue"
                  rows={4}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-[#23232b] border border-[#27272a] text-white focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color:'#d4d4d8'}}>
                  Upload Photo <span className="text-xs" style={{color:'#71717a'}}>(Optional)</span>
                </label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
                  style={{borderColor:'#27272a',background:'#23232b'}}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-input"
                    disabled={isUploading}
                  />
                  <label htmlFor="photo-input" className="cursor-pointer block">
                    {isUploading ? (
                      <div className="space-y-2">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin" style={{color:'#3b82f6'}} />
                        <p className="text-sm font-medium" style={{color:'#3b82f6'}}>Uploading to cloud...</p>
                      </div>
                    ) : photoPreview ? (
                      <div className="space-y-2">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover mx-auto rounded"
                        />
                        {uploadedImageUrl && (
                          <div className="flex items-center justify-center gap-2" style={{color:'#10b981'}}>
                            <CheckCircle className="w-4 h-4" />
                            <p className="text-sm font-medium">Uploaded successfully</p>
                          </div>
                        )}
                        <p className="text-sm" style={{color:'#71717a'}}>Click to change photo</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto" style={{color:'#52525b'}} />
                        <p className="text-sm font-medium" style={{color:'#d4d4d8'}}>Click to upload or drag and drop</p>
                        <p className="text-xs" style={{color:'#71717a'}}>PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
                {uploadError && (
                  <div className="mt-2 flex items-center gap-2 text-sm" style={{color:'#ef4444'}}>
                    <AlertCircle className="w-4 h-4" />
                    <p>{uploadError}</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploading || !formData.title || !formData.category || !formData.location || !formData.description}
                  className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  style={{background:'#3b82f6',color:'#fff',boxShadow:'0 2px 8px 0 rgba(59,130,246,.09)',opacity:isSubmitting||isUploading||!formData.title||!formData.category||!formData.location||!formData.description?0.6:1,pointerEvents:isSubmitting||isUploading||!formData.title||!formData.category||!formData.location||!formData.description? 'none':'auto'}}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading photo...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
                <button
                  onClick={() => window.history.back()}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-lg font-semibold transition"
                  style={{border:'2px solid #27272a',color:'#d4d4d8',background:'#23232b'}}
                >
                  Cancel
                </button>
              </div>

              {(!formData.title || !formData.category || !formData.location || !formData.description) && !isSubmitting && (
                <div className="flex items-start gap-2 text-sm p-3 rounded-lg border mt-2"
                  style={{background:'#312e81',borderColor:'#818cf8',color:'#fbbf24'}}>
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Please complete all required fields:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                      {!formData.title && <li>Issue Title</li>}
                      {!formData.category && <li>Category</li>}
                      {!formData.location && <li>Location</li>}
                      {!formData.description && <li>Description</li>}
                    </ul>
                  </div>
                </div>
              )}

              {uploadError && !isUploading && (
                <div className="mt-2 flex items-center gap-2 text-sm p-3 rounded-lg"
                  style={{background:'#450a0a',color:'#ef4444'}}>
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{uploadError}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
