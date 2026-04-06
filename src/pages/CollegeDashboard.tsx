import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  Link as LinkIcon,
  Upload,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  Briefcase,
  ChevronRight,
  Check,
  Edit2,
  X,
  Plus,
  Calendar,
  HelpCircle,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import api, { ASSET_URL } from "../services/api";

export const CollegeDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [college, setCollege] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    | "BASE"
    | "INFO"
    | "AFFILIATION"
    | "DATES"
    | "FAQ"
    | "COURSES"
    | "PLACEMENT"
    | "GALLERY"
  >("BASE");
  const [loading, setLoading] = useState(true);

  // Modular State Handling
  const [baseForm, setBaseForm] = useState<any>({});
  const [infoForm, setInfoForm] = useState<any>({});
  const [placementForm, setPlacementForm] = useState<any>({});

  // Specific Upload Refs
  const brochureRef = useRef<HTMLInputElement>(null);
  const feeStructureRef = useRef<HTMLInputElement>(null);

  // Stream Editing State
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<any>({
    name: "",
    degreeId: "",
    specializationId: "",
    duration: "",
    originalFee: "",
    discountedFee: "",
    eligibility: "",
    brochureUrl: "",
    feeStructureUrl: "",
  });
  const [degrees, setDegrees] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);

  // Accreditation Dynamic State
  const [newAcc, setNewAcc] = useState({ label: "", value: "" });

  // Deadline & FAQ States
  const [newDeadline, setNewDeadline] = useState({ event: "", date: "" });
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" });

  const STANDARD_FACILITIES = [
    "Library",
    "Hostel",
    "Playground",
    "WiFi",
    "Gym",
    "Cafeteria",
    "Laboratories",
    "Auditorium",
    "Medical Center",
    "Transport",
    "Placement Cell",
    "Smart Classrooms",
  ];

  useEffect(() => {
    fetchCollege();
    fetchDegrees();
    fetchUniversities();
  }, [id]);

  const fetchUniversities = async () => {
    try {
      const { data } = await api.get("/universities");
      setUniversities(data.data);
    } catch (err) {
      console.error("Univ fetch failed");
    }
  };

  const fetchDegrees = async () => {
    try {
      const { data } = await api.get("/degrees");
      setDegrees(data.data);
    } catch (err) {
      console.error("Degree fetch failed");
    }
  };

  const fetchSpecializations = async (degreeId: string) => {
    if (!degreeId) {
      setSpecializations([]);
      return;
    }
    try {
      const { data } = await api.get("/specializations", {
        params: { degreeId },
      });
      setSpecializations(data.data);
    } catch (err) {
      console.error("Spec fetch failed");
    }
  };

  const fetchCollege = async () => {
    try {
      const { data } = await api.get(`/colleges/${id}`);
      setCollege(data.data);
      setBaseForm(data.data);
      setInfoForm(data.data.info || {});
      setPlacementForm(data.data.placement || {});
    } catch (error) {
      console.error(error);
      navigate("/colleges");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // We now store relative paths in the database to be environment-consistent.
      return data.data.url;
    } catch (err) {
      alert("Upload Exception");
      return null;
    }
  };

  const saveBase = async () => {
    try {
      await api.put(`/colleges/${id}`, baseForm);
      alert("Base Updated");
      fetchCollege();
    } catch (e) {
      console.error(e);
    }
  };

  const saveInfo = async () => {
    try {
      await api.put(`/colleges/${id}/info`, infoForm);
      alert("Information Cluster Synchronized");
      fetchCollege();
    } catch (e) {
      console.error(e);
    }
  };

  const savePlacement = async () => {
    try {
      await api.put(`/colleges/${id}/placement`, placementForm);
      alert("Analytics Updated");
      fetchCollege();
    } catch (e) {
      console.error(e);
    }
  };

  const addOrUpdateCourse = async (e: any) => {
    e.preventDefault();
    const payload = { ...courseForm }; // Remove specific brochure/fee overrides, we only update if file exists
    if (brochureRef.current?.files?.[0])
      payload.brochureUrl =
        (await uploadFile({ target: brochureRef.current } as any)) || "";
    if (feeStructureRef.current?.files?.[0])
      payload.feeStructureUrl =
        (await uploadFile({ target: feeStructureRef.current } as any)) || "";

    try {
      if (editingCourseId) {
        await api.put(`/colleges/${id}/courses/${editingCourseId}`, payload);
      } else {
        await api.post(`/colleges/${id}/courses`, payload);
      }
      fetchCollege();
      if (brochureRef.current) brochureRef.current.value = "";
      if (feeStructureRef.current) feeStructureRef.current.value = "";
      cancelCourseEdit();
    } catch (err) {
      console.error(err);
    }
  };

  const startCourseEdit = (course: any) => {
    setEditingCourseId(course.id);
    setCourseForm({
      name: course.name,
      degreeId: course.degreeId || "",
      specializationId: course.specializationId || "",
      duration: course.duration || "",
      originalFee: course.originalFee,
      discountedFee: course.discountedFee,
      eligibility: course.eligibility || "",
      brochureUrl: course.brochureUrl || "",
      feeStructureUrl: course.feeStructureUrl || "",
    });
    if (course.degreeId) fetchSpecializations(course.degreeId);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const cancelCourseEdit = () => {
    setEditingCourseId(null);
    setCourseForm({
      name: "",
      degreeId: "",
      specializationId: "",
      duration: "",
      originalFee: "",
      discountedFee: "",
      eligibility: "",
      brochureUrl: "",
      feeStructureUrl: "",
    });
    setSpecializations([]);
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await api.delete(`/colleges/${id}/courses/${courseId}`);
      fetchCollege();
    } catch (err) {
      console.error(err);
    }
  };

  const addGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = await uploadFile(e);
    if (!url) return;
    try {
      await api.post(`/colleges/${id}/gallery`, { imageUrl: url, caption: "" });
      fetchCollege();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="p-8 font-semibold animate-pulse text-gray-500">
        Injecting Master CRM...
      </div>
    );

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "color"],
      ["clean"],
    ],
  };

  return (
    <div className="max-w-7xl space-y-6 animate-in slide-in-from-right-8 duration-300">
      {/* Header Overlay */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/colleges")}
            className="h-10 w-10 bg-gray-50 border rounded-lg flex items-center justify-center hover:bg-gray-100 transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <img
            src={
              college.logoUrl?.startsWith("http")
                ? college.logoUrl
                : `${ASSET_URL}${college.logoUrl}`
            }
            alt="Logo"
            className="h-16 w-16 bg-white p-1 ring-1 ring-gray-200 rounded object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{college.name}</h1>
            <p className="text-gray-500 text-sm font-medium">
              {college.city}, {college.state}{" "}
              <span className="mx-2 opacity-50">•</span> System Priority:{" "}
              {college.priorityScore}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Strict Vertical Navigation */}
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          {[
            { id: "BASE", label: "Identity Core" },
            { id: "INFO", label: "Rich Descriptions" },
            { id: "AFFILIATION", label: "Affiliation & Status" },
            { id: "DATES", label: "Admission Deadlines" },
            { id: "FAQ", label: "Helpful FAQs" },
            { id: "COURSES", label: "Streams & Brochures" },
            { id: "PLACEMENT", label: "Placement Analytics" },
            { id: "GALLERY", label: "Media Collection" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg font-semibold transition-all shadow-sm ring-1 ${activeTab === tab.id ? "bg-blue-600 text-white ring-blue-600 shadow-blue-500/20" : "bg-white text-gray-600 hover:bg-gray-50 ring-gray-200"}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <ChevronRight className="w-4 h-4 opacity-75" />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Detail Workspace Render Panel */}
        <div className="flex-1 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 min-h-[500px] w-full max-w-full overflow-x-auto p-6 lg:p-10">
          {/* TAB 1: BASE */}
          {activeTab === "BASE" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-bold border-b pb-2 mb-4 text-gray-900">
                Core Identity Fields
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                    City
                  </label>
                  <input
                    type="text"
                    value={baseForm.city}
                    onChange={(e) =>
                      setBaseForm({ ...baseForm, city: e.target.value })
                    }
                    className="w-full border p-2 rounded-lg text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                    State
                  </label>
                  <input
                    type="text"
                    value={baseForm.state}
                    onChange={(e) =>
                      setBaseForm({ ...baseForm, state: e.target.value })
                    }
                    className="w-full border p-2 rounded-lg text-sm bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                    System Priority (0-100)
                  </label>
                  <input
                    type="number"
                    value={baseForm.priorityScore || 0}
                    onChange={(e) =>
                      setBaseForm({
                        ...baseForm,
                        priorityScore: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border p-2 rounded-lg text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                    User Rating (0-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={baseForm.rating || 0}
                    onChange={(e) =>
                      setBaseForm({
                        ...baseForm,
                        rating: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border p-2 rounded-lg text-sm bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                    Ownership Type
                  </label>
                  <select
                    value={baseForm.ownershipType || ""}
                    onChange={(e) =>
                      setBaseForm({
                        ...baseForm,
                        ownershipType: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded-lg text-sm bg-gray-50 focus:bg-white font-medium"
                  >
                    <option value="">-- Select --</option>
                    <option value="Private">Private</option>
                    <option value="Public">Public (Government)</option>
                    <option value="Deemed">Deemed University</option>
                    <option value="Autonomous">Autonomous</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                    Logo Image URL
                  </label>
                  <div className="flex gap-4 items-center">
                    {baseForm.logoUrl && (
                      <img
                        src={
                          baseForm.logoUrl.startsWith("http")
                            ? baseForm.logoUrl
                            : `${ASSET_URL}${baseForm.logoUrl}`
                        }
                        alt="Preview"
                        className="w-12 h-12 object-contain bg-white rounded-lg border shadow-sm p-1"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                        onLoad={(e) =>
                          (e.currentTarget.style.display = "block")
                        }
                      />
                    )}
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={baseForm.logoUrl || ""}
                        onChange={(e) =>
                          setBaseForm({ ...baseForm, logoUrl: e.target.value })
                        }
                        className="flex-1 border p-2 rounded-lg text-sm bg-gray-50 focus:bg-white"
                      />
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 ring-1 ring-gray-300 px-4 py-2 rounded-lg flex items-center text-sm font-bold text-gray-700 transition-colors shadow-sm">
                        <Upload className="w-4 h-4 mr-2" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const url = await uploadFile(e as any);
                            if (url) setBaseForm({ ...baseForm, logoUrl: url });
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase text-gray-500 mb-3 block">
                    Campus Amenities & Facilities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-dashed">
                    {STANDARD_FACILITIES.map((facility) => (
                      <label
                        key={facility}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={(baseForm.facilities || []).includes(
                            facility,
                          )}
                          onChange={(e) => {
                            const current = baseForm.facilities || [];
                            const next = e.target.checked
                              ? [...current, facility]
                              : current.filter((f: string) => f !== facility);
                            setBaseForm({ ...baseForm, facilities: next });
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                          {facility}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={saveBase}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-500"
                  >
                    <Check className="w-4 h-4 inline mr-2" /> Apply Base Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RICH HTML INFO */}
          {activeTab === "INFO" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  Rich Description Generation
                </h2>
                <button
                  onClick={saveInfo}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium text-sm shadow flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Publish Content
                </button>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Detailed "About" SEO Paragraphs
                </label>
                <div className="bg-white">
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    value={infoForm.aboutHtml || ""}
                    onChange={(val: string) =>
                      setInfoForm({ ...infoForm, aboutHtml: val })
                    }
                    className="h-48 mb-12"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Admission & Application Details
                </label>
                <div className="bg-white">
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    value={infoForm.admissionsHtml || ""}
                    onChange={(val: string) =>
                      setInfoForm({ ...infoForm, admissionsHtml: val })
                    }
                    className="h-48 mb-12"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Scholarship / Grant Specifications
                </label>
                <div className="bg-white">
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    value={infoForm.scholarshipHtml || ""}
                    onChange={(val: string) =>
                      setInfoForm({ ...infoForm, scholarshipHtml: val })
                    }
                    className="h-48 mb-12"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AFFILIATION & ACCREDITATION */}
          {activeTab === "AFFILIATION" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold border-b pb-2 mb-6 text-gray-900 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-600" /> Parent
                  Affiliation Details
                </h2>
                <div className="grid grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <div>
                    <label className="text-xs font-bold uppercase text-blue-700 mb-1 block ml-1">
                      Parent University Node
                    </label>
                    <select
                      value={baseForm.universityId || ""}
                      onChange={(e) =>
                        setBaseForm({
                          ...baseForm,
                          universityId: e.target.value,
                        })
                      }
                      className="w-full border p-2.5 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- No Direct Affiliation --</option>
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} {u.shortName ? `(${u.shortName})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-blue-700 mb-1 block ml-1">
                      Operational Type
                    </label>
                    <select
                      value={baseForm.collegeType || ""}
                      onChange={(e) =>
                        setBaseForm({
                          ...baseForm,
                          collegeType: e.target.value,
                        })
                      }
                      className="w-full border p-2.5 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- Undefined --</option>
                      <option value="Affiliated">Affiliated College</option>
                      <option value="Autonomous">Autonomous Body</option>
                      <option value="Private University">
                        Private University
                      </option>
                      <option value="Deemed University">
                        Deemed University
                      </option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={saveBase}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Persist Affiliation State
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold border-b pb-2 mb-4 text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" /> Dynamic
                  Accreditations & Tags
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {college.accreditations?.map((acc: any) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between bg-white border border-purple-100 p-4 rounded-xl shadow-sm ring-1 ring-purple-900/5 group"
                    >
                      <div>
                        <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
                          {acc.label}
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {acc.value}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm("Delete marker?")) {
                            await api.delete(
                              `/colleges/${id}/accreditations/${acc.id}`,
                            );
                            fetchCollege();
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-dashed border-gray-300">
                  <form
                    className="flex flex-col sm:flex-row gap-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newAcc.label || !newAcc.value) return;
                      try {
                        await api.post(
                          `/colleges/${id}/accreditations`,
                          newAcc,
                        );
                        setNewAcc({ label: "", value: "" });
                        fetchCollege();
                      } catch (err) {
                        alert("Marker fail");
                      }
                    }}
                  >
                    <input
                      required
                      placeholder="Label (Ex: NAAC)"
                      value={newAcc.label}
                      onChange={(e) =>
                        setNewAcc({ ...newAcc, label: e.target.value })
                      }
                      className="flex-1 border p-2.5 rounded-lg text-sm bg-white"
                    />
                    <input
                      required
                      placeholder="Value (Ex: A++)"
                      value={newAcc.value}
                      onChange={(e) =>
                        setNewAcc({ ...newAcc, value: e.target.value })
                      }
                      className="flex-1 border p-2.5 rounded-lg text-sm bg-white"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Marker
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === "DATES" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b pb-4">
                <Calendar className="w-6 h-6 text-red-600" /> Critical Admission
                Deadlines
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {college.deadlines?.map((d: any) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-4 bg-red-50/30 border border-red-100 rounded-xl relative group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {d.event}
                      </div>
                      <div className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(d.date).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm("Delete deadline?")) {
                          await api.delete(`/colleges/${id}/deadlines/${d.id}`);
                          fetchCollege();
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-white ring-1 ring-gray-900/5 p-6 rounded-xl shadow-sm">
                <form
                  className="flex flex-col md:flex-row gap-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await api.post(`/colleges/${id}/deadlines`, newDeadline);
                      setNewDeadline({ event: "", date: "" });
                      fetchCollege();
                    } catch (err) {
                      alert("Deadline Save Fail");
                    }
                  }}
                >
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                      Event Name
                    </label>
                    <input
                      required
                      value={newDeadline.event}
                      onChange={(e) =>
                        setNewDeadline({
                          ...newDeadline,
                          event: e.target.value,
                        })
                      }
                      className="w-full border p-2.5 rounded-lg text-sm bg-gray-50"
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                      Cutoff Date
                    </label>
                    <input
                      required
                      type="date"
                      value={newDeadline.date}
                      onChange={(e) =>
                        setNewDeadline({ ...newDeadline, date: e.target.value })
                      }
                      className="w-full border p-2.5 rounded-lg text-sm bg-gray-50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="md:mt-5 bg-red-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm"
                  >
                    Schedule
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "FAQ" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b pb-4">
                <HelpCircle className="w-6 h-6 text-indigo-600" /> Dynamic FAQ
                Builder
              </h2>

              <div className="space-y-4">
                {college.faqs?.map((faq: any) => (
                  <div
                    key={faq.id}
                    className="bg-indigo-50/20 ring-1 ring-indigo-100 p-5 rounded-2xl relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-indigo-900">
                        Q: {faq.question}
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm("Delete FAQ?")) {
                            await api.delete(`/colleges/${id}/faqs/${faq.id}`);
                            fetchCollege();
                          }
                        }}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 font-medium pl-4 border-l-2 border-indigo-200">
                      A: {faq.answer}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white ring-1 ring-gray-900/10 p-6 rounded-2xl shadow-xl">
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await api.post(`/colleges/${id}/faqs`, newFAQ);
                      setNewFAQ({ question: "", answer: "" });
                      fetchCollege();
                    } catch (err) {
                      alert("FAQ failed");
                    }
                  }}
                >
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">
                      Question
                    </label>
                    <input
                      required
                      value={newFAQ.question}
                      onChange={(e) =>
                        setNewFAQ({ ...newFAQ, question: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl text-sm bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">
                      Answer
                    </label>
                    <textarea
                      required
                      value={newFAQ.answer}
                      onChange={(e) =>
                        setNewFAQ({ ...newFAQ, answer: e.target.value })
                      }
                      rows={3}
                      className="w-full border p-3 rounded-xl text-sm bg-gray-50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Publish Pair
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: COURSES & BROCHURES */}
          {activeTab === "COURSES" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold border-b pb-2 mb-4 text-gray-900">
                  Nested Stream Modules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {college.courses.map((course: any) => (
                    <div
                      key={course.id}
                      className="border ring-1 ring-gray-900/5 rounded-xl p-5 relative bg-white shadow-sm flex flex-col"
                    >
                      <h4 className="font-bold text-gray-900 text-sm">
                        {course.name}
                      </h4>
                      <div className="text-xs text-gray-500 font-medium mt-1 uppercase">
                        Eligibility: {course.eligibility || "N/A"} •{" "}
                        {course.duration || "Variable"}
                      </div>
                      <div className="mt-4 pt-4 border-t flex flex-col gap-2 relative">
                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold line-through">
                            ₹{course.originalFee}
                          </span>
                          <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold ring-1 ring-green-600/20">
                            ₹{course.discountedFee}
                          </span>
                        </div>
                        <div className="mt-4 flex gap-2">
                          {course.brochureUrl && (
                            <a
                              href={
                                course.brochureUrl.startsWith("http")
                                  ? course.brochureUrl
                                  : `${ASSET_URL}${course.brochureUrl}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 text-center bg-blue-50 text-blue-700 text-xs font-semibold py-2 rounded-md border border-blue-200"
                            >
                              Brochure
                            </a>
                          )}
                          {course.feeStructureUrl && (
                            <a
                              href={
                                course.feeStructureUrl.startsWith("http")
                                  ? course.feeStructureUrl
                                  : `${ASSET_URL}${course.feeStructureUrl}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 text-center bg-purple-50 text-purple-700 text-xs font-semibold py-2 rounded-md border border-purple-200"
                            >
                              Fees
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                          onClick={() => startCourseEdit(course)}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`p-6 rounded-xl border transition-colors ${editingCourseId ? "bg-blue-50 border-blue-200 shadow-inner" : "bg-gray-50"}`}
              >
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                  <h3 className="font-bold text-gray-900">
                    {editingCourseId ? "Modify Stream" : "Mount New Stream"}
                  </h3>
                  {editingCourseId && (
                    <button
                      onClick={cancelCourseEdit}
                      className="text-sm font-semibold text-red-600 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
                <form onSubmit={addOrUpdateCourse} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                        Degree
                      </label>
                      <select
                        required
                        value={courseForm.degreeId}
                        onChange={(e) => {
                          setCourseForm({
                            ...courseForm,
                            degreeId: e.target.value,
                            specializationId: "",
                          });
                          fetchSpecializations(e.target.value);
                        }}
                        className="w-full border p-2 rounded-md text-sm bg-purple-50"
                      >
                        <option value="">-- Degree --</option>
                        {degrees.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                        Specialization
                      </label>
                      <select
                        required
                        value={courseForm.specializationId}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            specializationId: e.target.value,
                          })
                        }
                        className="w-full border p-2 rounded-md text-sm bg-indigo-50"
                        disabled={!courseForm.degreeId}
                      >
                        <option value="">-- Specialization --</option>
                        {specializations.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                        Display Name
                      </label>
                      <input
                        required
                        value={courseForm.name}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, name: e.target.value })
                        }
                        type="text"
                        className="w-full border p-2 rounded-md text-sm"
                        placeholder="Ex: Computer Science"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                        Duration
                      </label>
                      <input
                        value={courseForm.duration}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            duration: e.target.value,
                          })
                        }
                        type="text"
                        className="w-full border p-2 rounded-md text-sm"
                        placeholder="Ex: 4 Years"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                        Eligibility
                      </label>
                      <input
                        required
                        value={courseForm.eligibility}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            eligibility: e.target.value,
                          })
                        }
                        type="text"
                        className="w-full border p-2 rounded-md text-sm"
                        placeholder="Ex: 10+2 with 60% PCM"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                        Original Fee
                      </label>
                      <input
                        required
                        value={courseForm.originalFee}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            originalFee: e.target.value,
                          })
                        }
                        type="number"
                        className="w-full border p-2 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                        Discounted Fee
                      </label>
                      <input
                        required
                        value={courseForm.discountedFee}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            discountedFee: e.target.value,
                          })
                        }
                        type="number"
                        className="w-full border p-2 rounded-md text-sm bg-green-50"
                      />
                    </div>

                    <div className="col-span-2 border-t pt-4 mt-2">
                      <label className="text-xs font-bold text-blue-700 uppercase mb-2 block flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Media (Brochure / Fees)
                      </label>
                      <div className="flex gap-4">
                        <div className="flex-1 bg-white p-3 rounded-lg border relative">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-[10px] font-bold text-gray-400">
                              Brochure PDF
                            </p>
                            {courseForm.brochureUrl && (
                              <a
                                href={
                                  courseForm.brochureUrl.startsWith("http")
                                    ? courseForm.brochureUrl
                                    : `${ASSET_URL}${courseForm.brochureUrl}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 font-extrabold flex items-center gap-0.5 hover:underline"
                              >
                                <LinkIcon className="w-2.5 h-2.5" /> View
                                Existing
                              </a>
                            )}
                          </div>
                          <input
                            type="file"
                            ref={brochureRef}
                            accept=".pdf,image/*"
                            className="text-xs w-full"
                          />
                        </div>
                        <div className="flex-1 bg-white p-3 rounded-lg border relative">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-[10px] font-bold text-gray-400">
                              Fee Structure PDF
                            </p>
                            {courseForm.feeStructureUrl && (
                              <a
                                href={
                                  courseForm.feeStructureUrl.startsWith("http")
                                    ? courseForm.feeStructureUrl
                                    : `${ASSET_URL}${courseForm.feeStructureUrl}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-purple-600 font-extrabold flex items-center gap-0.5 hover:underline"
                              >
                                <LinkIcon className="w-2.5 h-2.5" /> View
                                Existing
                              </a>
                            )}
                          </div>
                          <input
                            type="file"
                            ref={feeStructureRef}
                            accept=".pdf,image/*"
                            className="text-xs w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`mt-6 w-full py-3 rounded-lg font-bold text-sm shadow transition-colors ${editingCourseId ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-900 hover:bg-black text-white"}`}
                  >
                    {editingCourseId ? "Update Stream" : "Add Course"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: PLACEMENT */}
          {activeTab === "PLACEMENT" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex-1">
                  Aggregated Analytics
                </h2>
                <button
                  onClick={savePlacement}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium text-sm shadow flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Store Variables
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6 pb-6 border-b">
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Highest Salary Package
                  </label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-2.5 font-bold text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={placementForm.highestPackage || ""}
                      onChange={(e) =>
                        setPlacementForm({
                          ...placementForm,
                          highestPackage: e.target.value,
                        })
                      }
                      className="w-full border-0 py-2.5 pl-8 pr-3 rounded-md shadow-sm ring-1 ring-inset ring-gray-300 font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      placeholder="4500000"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Average Standard Package
                  </label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-2.5 font-bold text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={placementForm.averagePackage || ""}
                      onChange={(e) =>
                        setPlacementForm({
                          ...placementForm,
                          averagePackage: e.target.value,
                        })
                      }
                      className="w-full border-0 py-2.5 pl-8 pr-3 rounded-md shadow-sm ring-1 ring-inset ring-gray-300 font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      placeholder="600000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GALLERY */}
          {activeTab === "GALLERY" && (
            <div className="space-y-6 animate-in fade-in duration-300 bg-gray-50 p-6 rounded-xl border border-dashed">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5" /> College Photo Gallery
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-white ring-1 ring-gray-200 rounded-xl shadow-sm">
                <div className="flex-1 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={addGalleryImage}
                    className="block w-full text-sm border rounded-lg bg-gray-50"
                  />
                </div>
                <div className="flex-1 w-full">
                  <form
                    className="flex gap-2"
                    onSubmit={async (e: any) => {
                      e.preventDefault();
                      try {
                        await api.post(`/colleges/${id}/gallery`, {
                          imageUrl: e.target.url.value,
                          caption: "",
                        });
                        fetchCollege();
                        e.target.reset();
                      } catch (err) {}
                    }}
                  >
                    <input
                      name="url"
                      type="url"
                      placeholder="Image URL..."
                      required
                      className="flex-1 border p-2.5 text-sm rounded-lg"
                    />
                    <button
                      type="submit"
                      className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow"
                    >
                      Add
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-8 flex gap-4 flex-wrap">
                {college.galleries.map((img: any) => (
                  <div
                    key={img.id}
                    className="relative group w-40 h-32 rounded-lg overflow-hidden ring-1 ring-gray-200 shadow bg-white p-1"
                  >
                    <img
                      src={
                        img.imageUrl.startsWith("http")
                          ? img.imageUrl
                          : `${ASSET_URL}${img.imageUrl}`
                      }
                      alt="Campus"
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Eradicate image from storage cluster?",
                          )
                        ) {
                          await api.delete(`/colleges/${id}/gallery/${img.id}`);
                          fetchCollege();
                        }
                      }}
                      className="absolute inset-0 bg-red-600/0 text-white font-bold opacity-0 group-hover:opacity-100 group-hover:bg-red-600/80 flex flex-col items-center justify-center transition-all duration-200 text-sm"
                    >
                      <Trash2 className="w-6 h-6 mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform" />
                      <span className="text-[10px] uppercase tracking-tighter font-black">
                        Destroy Node
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
