
const express = require("express");
const Employee = require("../models/Employee");

const router = express.Router();

// API lấy danh sách nhân viên và tìm kiếm

router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    let filter = {};

    if (search) {
      const keyword = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter = {
        $or: [
          { employeeCode: { $regex: keyword, $options: "i" } },
          { fullName: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
          { department: { $regex: keyword, $options: "i" } },
          { position: { $regex: keyword, $options: "i" } },
        ],
      };
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tìm kiếm nhân viên",
      error: error.message,
    });
  }
});


// API thêm nhân viên
router.post("/", async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

 // API sửa thông tin nhân viên
router.put("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên"
      });
    }

    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// API xóa nhân viên
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên"
      });
    }

    res.json({ message: "Xóa nhân viên thành công" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
