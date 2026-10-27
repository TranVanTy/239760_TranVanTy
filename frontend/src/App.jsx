
import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    employeeCode: "",
    fullName: "",
    email: "",
    department: "",
    position: "",
    salary: "",
  });
  const [editingId, setEditingId] = useState(null);

  async function loadEmployees(keyword = search) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/employees?search=${encodeURIComponent(keyword)}`
      );

      if (!response.ok) {
        throw new Error("Không thể tải danh sách nhân viên.");
      }

      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(
        "Không kết nối được máy chủ. Hãy kiểm tra backend tại cổng 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees("");
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function resetForm() {
    setForm({
      employeeCode: "",
      fullName: "",
      email: "",
      department: "",
      position: "",
      salary: "",
    });
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      ...form,
      salary: Number(form.salary),
    };

    try {
      const response = await fetch(
        editingId
          ? `${API_URL}/employees/${editingId}`
          : `${API_URL}/employees`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể lưu nhân viên.");
      }

      resetForm();
      await loadEmployees("");
      setSearch("");
      alert(editingId ? "Cập nhật nhân viên thành công!" : "Thêm nhân viên thành công!");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi lưu dữ liệu.");
    }
  }

  function handleEdit(employee) {
    setEditingId(employee._id);
    setForm({
      employeeCode: employee.employeeCode || "",
      fullName: employee.fullName || "",
      email: employee.email || "",
      department: employee.department || "",
      position: employee.position || "",
      salary: String(employee.salary ?? ""),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa nhân viên ${employee.fullName}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/employees/${employee._id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể xóa nhân viên.");
      }

      await loadEmployees();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi xóa.");
    }
  }

  const totalSalary = employees.reduce(
    (sum, employee) => sum + Number(employee.salary || 0),
    0
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">HR</div>
          <div>
            <h2>PeopleHub</h2>
            <span>HR MANAGEMENT</span>
          </div>
        </div>

        <p className="menu-label">QUẢN LÝ</p>
        <div className="menu-item active">▦ &nbsp; Nhân viên</div>
        <div className="menu-item">◷ &nbsp; Chấm công</div>
        <div className="menu-item">▤ &nbsp; Phòng ban</div>
        <div className="menu-item">▣ &nbsp; Báo cáo</div>

        <div className="sidebar-bottom">
          <div className="avatar">AD</div>
          <div>
            <strong>Quản trị viên</strong>
            <span>Administrator</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Trang chủ / Nhân sự</span>
            <h1>Quản lý nhân viên</h1>
            <p className="subtitle">
              Quản lý hồ sơ và thông tin nhân sự của doanh nghiệp.
            </p>
          </div>
          <div className="topbar-right">
            <span className="status-dot"></span>
            Hệ thống nhân sự
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon purple">♙</div>
            <div>
              <span>Tổng nhân viên</span>
              <h2>{employees.length}</h2>
              <small>Nhân viên trong danh sách</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">▤</div>
            <div>
              <span>Phòng ban</span>
              <h2>
                {new Set(
                  employees.map((e) => e.department).filter(Boolean)
                ).size}
              </h2>
              <small>Phòng ban hiện có</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">₫</div>
            <div>
              <span>Tổng lương danh sách</span>
              <h2>{totalSalary.toLocaleString("vi-VN")} ₫</h2>
              <small>Tổng lương nhân viên đang hiển thị</small>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{editingId ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}</h2>
              <p>Nhập thông tin nhân viên bên dưới.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="employee-form">
            <label>
              Mã nhân viên *
              <input
                name="employeeCode"
                value={form.employeeCode}
                onChange={handleChange}
                placeholder="VD: NV004"
                required
              />
            </label>

            <label>
              Họ và tên *
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                required
              />
            </label>

            <label>
              Email *
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </label>

            <label>
              Phòng ban *
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="VD: IT"
                required
              />
            </label>

            <label>
              Chức vụ *
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="VD: Frontend Developer"
                required
              />
            </label>

            <label>
              Lương (VNĐ) *
              <input
                name="salary"
                type="number"
                min="0"
                value={form.salary}
                onChange={handleChange}
                placeholder="VD: 12000000"
                required
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingId ? "Lưu thay đổi" : "+ Thêm nhân viên"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel employee-panel">
          <div className="panel-heading employee-heading">
            <div>
              <h2>Danh sách nhân viên</h2>
              <p>Tra cứu và quản lý hồ sơ nhân viên.</p>
            </div>

            <form
              className="search-box"
              onSubmit={(event) => {
                event.preventDefault();
                loadEmployees(search);
              }}
            >
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm tên, mã, email..."
              />
              <button type="submit">Tìm kiếm</button>
            </form>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>MÃ NV</th>
                  <th>NHÂN VIÊN</th>
                  <th>PHÒNG BAN</th>
                  <th>CHỨC VỤ</th>
                  <th>LƯƠNG (VNĐ)</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="empty">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty">
                      Chưa có nhân viên phù hợp.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        <span className="employee-code">
                          {employee.employeeCode}
                        </span>
                      </td>
                      <td>
                        <div className="employee-name">
                          <div className="avatar small">
                            {(employee.fullName || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{employee.fullName}</strong>
                            <span>{employee.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="department-tag">
                          {employee.department}
                        </span>
                      </td>
                      <td>{employee.position}</td>
                      <td className="salary">
                        {Number(employee.salary).toLocaleString("vi-VN")} ₫
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(employee)}
                            type="button"
                          >
                            Sửa
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(employee)}
                            type="button"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Đang hiển thị {employees.length} nhân viên
          </div>
        </section>

        <footer>
          © 2026 PeopleHub · Hệ thống quản lý nhân sự
        </footer>
      </main>
    </div>
  );
}

export default App;
