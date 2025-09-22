// ===== GLOBAL VARIABLES =====
let currentInterval = null;
let listKhoa = [];
let listPhong = [];
let phongDropdown = null;
let khoaDropdown = null;

// Flag để xử lý Enter lần 2 lưu
let enterAfterSelectPhong = false;

// ===== HELPER FUNCTION: highlight search keywords =====
function highlightMatch(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    return text.replace(regex, "<span class='highlight'>$1</span>");
}

// ===== MAIN FUNCTION: Load Patient Queue Data =====
//async function loadSTT(idPhongBuong, idChiNhanh) {
//    try {
//        const res = await fetch(`/load_so_thu_tu_phong/filter?IdPhongBuong=${idPhongBuong}&IdChiNhanh=${idChiNhanh}`, {
//            method: "POST"
//        });

//        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//        const json = await res.json();


//        const data = json.data || [];
//        const intervalTime = (json.thoiGian || 5);
//        const soDongHienThi = json.soDong || 5; // Lấy từ server

//        console.log("Số dòng sẽ hiển thị:", soDongHienThi);

//        // ===== Main Table =====
//        const tbody = document.getElementById("sttList");
//        if (tbody) {
//            tbody.innerHTML = "";

//            // lọc bỏ bản ghi không cần thiết + loại luôn qua lượt (trangThai = 4)
//            let mainData = data.filter(item =>
//                !(item.SoLanGoi === 1 && item.BatDauXuLy === 1) &&
//                item.trangThai !== 4
//            );

//            // sắp xếp theo số thứ tự
//            mainData.sort((a, b) => a.soThuTu - b.soThuTu);

//            // chỉ lấy số bản ghi tối đa từ server
//            mainData = mainData.slice(0, soDongHienThi);

//            if (!mainData.length) {
//                tbody.innerHTML = `<tr><td colspan="2" class="text-center py-3">Không có số thứ tự</td></tr>`;
//            } else {
//                // tách bản ghi đang thực hiện
//                const dangThucHien = mainData.find(item => item.trangThai === 1);
//                const dangCho = mainData.filter(item => item.trangThai !== 1);

//                // 1. hàng đang thực hiện
//                if (dangThucHien) {
//                    const tr = document.createElement("tr");
//                    tr.innerHTML = `
//                        <td style="font-size: 5rem; background-color: #ECF3FB !important;" class="status-wait">Đang khám</td>
//                        <td style="font-size: 6rem;">${dangThucHien.soThuTu}</td>
//                    `;
//                    tbody.appendChild(tr);
//                }

//                // 2. hàng đang chờ (nối chuỗi STT)
//                if (dangCho.length > 0) {
//                    const sttList = dangCho.map(x => x.soThuTu).join(", ");
//                    const tr = document.createElement("tr");
//                    tr.innerHTML = `
//                        <td style="font-size: 5rem;background-color: #ECF3FB !important;" class="status-empty">Chuẩn bị</td>
//                        <td style="font-size: 6rem;">${sttList}</td>
//                    `;
//                    tbody.appendChild(tr);
//                }
//            }
//        }

//        // ===== Missed Patients Ticker =====
//        const quaLuotContainer = document.getElementById("quaLuotList");
//        if (quaLuotContainer) {
//            quaLuotContainer.innerHTML = "";
//            const quaLuotData = data.filter(item => item.trangThai === 4);

//            if (!quaLuotData.length) {
//                quaLuotContainer.innerHTML = `<span class="badge bg-secondary-subtle text-secondary px-3 py-2"></span>`;
//            } else {
//                quaLuotData.forEach(item => {
//                    const pill = document.createElement("div");
//                    pill.className = "ticker-item";
//                    pill.innerText = ` STT ${item.soThuTu}`;
//                    quaLuotContainer.appendChild(pill);
//                });
//            }
//        }

//        // Restart interval với thời gian từ server
//        if (currentInterval) clearTimeout(currentInterval);
//        currentInterval = setTimeout(() => loadSTT(idPhongBuong, idChiNhanh), intervalTime );

//    } catch (err) {
//        console.error("Error loading STT:", err);
//        if (currentInterval) clearTimeout(currentInterval);
//        currentInterval = setTimeout(() => loadSTT(idPhongBuong, idChiNhanh), 5000);
//    }
//}
async function loadSTT(idPhongBuong, idChiNhanh) {
    try {
        const res = await fetch(`/load_so_thu_tu_phong/filter?IdPhongBuong=${idPhongBuong}&IdChiNhanh=${idChiNhanh}`, {
            method: "POST"
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
        const data = json.data || [];
        const intervalTime = (json.thoiGian || 5);
        const soDongHienThi = json.soDong || 5;

        console.log("Số dòng sẽ hiển thị:", soDongHienThi);

        // ===== Main Table =====
        const tbody = document.getElementById("sttList");
        if (tbody) {
            tbody.innerHTML = "";

            // lọc bỏ bản ghi trạng thái = 4 (qua lượt)
            let mainData = data.filter(item => item.trangThai !== 4);

            // sắp xếp theo số thứ tự
            mainData.sort((a, b) => a.soThuTu - b.soThuTu);

            // giới hạn số dòng hiển thị
            mainData = mainData.slice(0, soDongHienThi);

            // tách bản ghi đang thực hiện (trangThai = 1)
            const dangThucHien = mainData.find(item => item.trangThai === 1);
            const dangCho = mainData.filter(item => item.trangThai !== 1);

            // 1. hàng đang thực hiện (luôn có)
            const tr1 = document.createElement("tr");
            tr1.innerHTML = `
                <td style="font-size: 5rem; background-color: #ECF3FB !important;    color: #338BB9 !important;">Đang khám</td>
                <td style="font-size: 6rem;">${dangThucHien ? dangThucHien.soThuTu : ""}</td>
            `;
            tbody.appendChild(tr1);

            // 2. hàng chuẩn bị + chờ (luôn có)
            const sttList = dangCho.length > 0 ? dangCho.map(x => x.soThuTu).join(", ") : "";
            const tr2 = document.createElement("tr");
            tr2.innerHTML = `
                <td style="font-size: 5rem; background-color: #ECF3FB !important; color: #338BB9 !important;">Chuẩn bị</td>
                <td style="font-size: 6rem;">${sttList}</td>
            `;
            tbody.appendChild(tr2);
        }

        // ===== Missed Patients Ticker =====
        const quaLuotContainer = document.getElementById("quaLuotList");
        if (quaLuotContainer) {
            quaLuotContainer.innerHTML = "";
            const quaLuotData = data.filter(item => item.trangThai === 4);

            if (!quaLuotData.length) {
                quaLuotContainer.innerHTML = `<span class="badge bg-secondary-subtle text-secondary px-3 py-2"></span>`;
            } else {
                quaLuotData.forEach(item => {
                    const pill = document.createElement("div");
                    pill.className = "ticker-item";
                    pill.innerText = ` STT ${item.soThuTu}`;
                    quaLuotContainer.appendChild(pill);
                });
            }
        }

        // Restart interval với thời gian từ server
        if (currentInterval) clearTimeout(currentInterval);
        currentInterval = setTimeout(() => loadSTT(idPhongBuong, idChiNhanh), intervalTime);

    } catch (err) {
        console.error("Error loading STT:", err);
        if (currentInterval) clearTimeout(currentInterval);
        currentInterval = setTimeout(() => loadSTT(idPhongBuong, idChiNhanh), 5000);
    }
}


// ===== Search Dropdown Component =====
function initSearchDropdown({ inputId, dropdownId, hiddenFieldId, data = [], onSelect }) {
    const $input = $("#" + inputId);
    const $dropdown = $("#" + dropdownId);
    const $hidden = $("#" + hiddenFieldId);
    let currentData = data;
    let activeIndex = -1;

    function renderDropdown(keyword, items) {
        $dropdown.empty();
        activeIndex = -1;

        const filtered = items.filter(x =>
            x.ten.toLowerCase().includes(keyword.toLowerCase()) ||
            (x.viettat && x.viettat.toLowerCase().includes(keyword.toLowerCase())) ||
            (x.alias && x.alias.toLowerCase().includes(keyword.toLowerCase()))
        );

        if (!filtered.length) {
            $dropdown.hide();
            return;
        }

        filtered.forEach((x, idx) => {
            const nameHtml = highlightMatch(x.ten, keyword);
            const aliasHtml = x.viettat ? highlightMatch(x.viettat, keyword) : "";
            const html = `
                <div class="d-flex justify-content-between align-items-center">
                    <span class="name">${nameHtml}</span>
                    ${aliasHtml ? `<span class="alias text-muted">[${aliasHtml}]</span>` : ""}
                </div>
            `;
            const $item = $(`<div class="dropdown-item" data-id="${x.id}">${html}</div>`);
            $item.on("click", () => selectItem(x));
            $dropdown.append($item);
        });

        $dropdown.show();

        const selectedId = parseInt($hidden.val(), 10);
        const $items = $dropdown.children(".dropdown-item");

        if (!isNaN(selectedId)) {
            const idx = filtered.findIndex(x => x.id === selectedId);
            if (idx >= 0) {
                $items.removeClass("active").eq(idx).addClass("active");
                activeIndex = idx;
                $items[idx].scrollIntoView({ block: "nearest" });
            } else if ($items.length > 0) {
                $items.removeClass("active").first().addClass("active");
                activeIndex = 0;
                $items[0].scrollIntoView({ block: "nearest" });
            }
        } else if ($items.length > 0) {
            $items.first().addClass("active");
            activeIndex = 0;
            $items[0].scrollIntoView({ block: "nearest" });
        }
    }

    function selectItem(item) {
        $input.val(item.ten);
        $hidden.val(item.id);
        $dropdown.hide();
        if (onSelect) onSelect(item);
        enterAfterSelectPhong = true; // đánh dấu đã chọn xong
    }

    $input.on("input focus", () => renderDropdown($input.val(), currentData));

    $input.on("keydown", e => {
        const $items = $dropdown.children(".dropdown-item");
        if (!$items.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % $items.length;
            $items.removeClass("active").eq(activeIndex).addClass("active")[0].scrollIntoView({ block: "nearest" });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + $items.length) % $items.length;
            $items.removeClass("active").eq(activeIndex).addClass("active")[0].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0) {
                const $active = $items.eq(activeIndex);
                const id = parseInt($active.data("id"), 10);
                const chosen = currentData.find(x => x.id === id);
                if (chosen) selectItem(chosen);
            } else if (enterAfterSelectPhong) {
                // Enter lần 2: tự lưu
                const phongId = parseInt($("#selectedPhongId").val(), 10);
                const khoaId = parseInt($("#selectedKhoaId").val(), 10);
                if (!isNaN(phongId) && phongId > 0 && !isNaN(khoaId) && khoaId > 0) {
                    $("#saveRoomBtn").click();
                    enterAfterSelectPhong = false; // reset flag
                }
            }
        } else {
            enterAfterSelectPhong = false; // reset nếu gõ phím khác
        }
    });

    $(document).on("click", e => {
        if (!$(e.target).closest("#" + inputId).length && !$(e.target).closest("#" + dropdownId).length)
            $dropdown.hide();
    });

    return {
        renderDropdown: (keyword, items) => renderDropdown(keyword, items),
        setData: newData => { currentData = newData; }
    };
}

// ===== DOM READY =====
document.addEventListener("DOMContentLoaded", function () {
    if (typeof $ === 'undefined') { console.error("jQuery is not loaded."); return; }
    if (typeof bootstrap === 'undefined') { console.error("Bootstrap is not loaded."); return; }

    $.getJSON("dist/data/json/DM_Khoa.json", dataKhoa => {
        listKhoa = dataKhoa.map(n => ({
            ...n,
            alias: n.viettat?.trim() !== "" ? n.viettat.toUpperCase() :
                n.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
        }));

        $.getJSON("dist/data/json/DM_PhongBuong.json", dataPhong => {
            listPhong = dataPhong.map(n => ({
                ...n,
                alias: n.viettat?.trim() !== "" ? n.viettat.toUpperCase() :
                    n.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
            })).filter(n => n.idcn === window._idcn);

            phongDropdown = initSearchDropdown({
                inputId: "searchPhong",
                dropdownId: "dropdownPhong",
                hiddenFieldId: "selectedPhongId",
                data: listPhong,
                onSelect: ({ id }) => {
                    const phong = listPhong.find(p => p.id === parseInt(id, 10));
                    if (phong) {
                        const khoa = listKhoa.find(k => k.id === phong.idKhoa);
                        if (khoa) {
                            $("#searchKhoa").val(khoa.ten);
                            $("#selectedKhoaId").val(khoa.id);
                        }
                    }
                }
            });

            khoaDropdown = initSearchDropdown({
                inputId: "searchKhoa",
                dropdownId: "dropdownKhoa",
                hiddenFieldId: "selectedKhoaId",
                data: listKhoa,
                onSelect: ({ id }) => {
                    const khoaId = parseInt(id, 10);
                    $("#searchPhong").val("");
                    $("#selectedPhongId").val("");
                    const filteredPhong = listPhong.filter(p => p.idKhoa === khoaId);
                    phongDropdown.setData(filteredPhong);
                    $("#dropdownPhong").empty();
                    phongDropdown.renderDropdown("", filteredPhong);
                    setTimeout(() => $("#searchPhong").focus(), 100);
                }
            });

            $("#saveRoomBtn").on("click", function () {
                const phongId = parseInt($("#selectedPhongId").val(), 10);
                const phong = listPhong.find(p => p.id === phongId);
                if (phong) {
                    $("#roomName").text(phong.ten);
                    if (currentInterval) { clearTimeout(currentInterval); currentInterval = null; }
                    if (phongId && window._idcn) loadSTT(phongId, window._idcn);
                }
                const modal = bootstrap.Modal.getInstance(document.getElementById("settingsModal"));
                modal.hide();
            });

        }).fail(() => console.error("Error loading DM_PhongBuong.json"));
    }).fail(() => console.error("Error loading DM_Khoa.json"));

    const idPhongBuongInput = document.getElementById("selectedPhongId");
    if (idPhongBuongInput && idPhongBuongInput.value && window._idcn) {
        const phongId = parseInt(idPhongBuongInput.value, 10);
        if (!isNaN(phongId) && phongId > 0) loadSTT(phongId, window._idcn);
    }
});

// XÓA PHÒNG BẰNG BACKSPACE (FULL CLEAR)
document.getElementById("searchPhong").addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && $("#selectedPhongId").val()) {
        e.preventDefault(); // chặn xoá từng ký tự
        this.value = "";
        $("#selectedPhongId").val("");
        enterAfterSelectPhong = false;

        if (phongDropdown) {
            const khoaId = parseInt($("#selectedKhoaId").val(), 10);
            const filteredPhong = (!isNaN(khoaId) && khoaId > 0)
                ? listPhong.filter(p => p.idKhoa === khoaId)
                : listPhong;

            phongDropdown.setData(filteredPhong);
            $("#dropdownPhong").empty();
            phongDropdown.renderDropdown("", filteredPhong);
        }
    }
});

// XÓA KHOA BẰNG BACKSPACE (FULL CLEAR)
document.getElementById("searchKhoa").addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && $("#selectedKhoaId").val()) {
        e.preventDefault(); // chặn xoá từng ký tự
        this.value = "";
        $("#selectedKhoaId").val("");
        $("#searchPhong").val("");
        $("#selectedPhongId").val("");
        enterAfterSelectPhong = false;

        if (phongDropdown) {
            phongDropdown.setData(listPhong);
            $("#dropdownPhong").empty();
        }
        if (khoaDropdown) {
            khoaDropdown.setData(listKhoa);
            khoaDropdown.renderDropdown("", listKhoa);
        }
    }
});
