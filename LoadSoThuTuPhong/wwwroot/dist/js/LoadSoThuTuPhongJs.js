// ===== BIẾN TOÀN CỤC =====
let currentInterval = null;

// ===== HÀM LOAD SỐ THỨ TỰ =====
async function loadSTT(idPhongBuong, idChiNhanh) {
    if (!idPhongBuong || isNaN(idPhongBuong) || idPhongBuong <= 0 || !idChiNhanh) {
        console.error("Tham số không hợp lệ. Dừng loadSTT.", { idPhongBuong, idChiNhanh });
        return;
    }

    try {
        const res = await fetch(`/load_so_thu_tu_phong/filter?IdPhongBuong=${idPhongBuong}&IdChiNhanh=${idChiNhanh}`, {
            method: "POST"
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
        const data = json.data || [];
        console.log("Data nhận từ server:", data);

        const intervalTime = (json.ThoiGian || 5) * 1000;

        // ===== Bảng chính =====
        const tbody = document.getElementById("sttList");
        if (!tbody) return;
        tbody.innerHTML = "";

        // Lấy những người chưa khám xong
        let mainData = data.filter(item => !(item.SoLanGoi === 1 && item.BatDauXuLy === 1));

        // Sắp xếp: 1–3 trước, 4 cuối
        mainData.sort((a, b) => {
            if (a.trangThai === 4 && b.trangThai !== 4) return 1;
            if (a.trangThai !== 4 && b.trangThai === 4) return -1;
            return a.soThuTu - b.soThuTu; // cùng loại thì theo số thứ tự
        });

        // Chỉ hiển thị 5 người đầu tiên
        mainData = mainData.slice(0, 5);

        if (!mainData.length) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-3">Không có số thứ tự</td></tr>`;
        } else {
            mainData.forEach(item => {
                const tr = document.createElement("tr");
                let statusClass = "", statusText = "";

                // ==== giữ nguyên if/else cũ ====
                if (item.trangThai === 1) {
                    statusClass = "status-invite";
                    statusText = "Đang mời";
                } else if (item.trangThai === 2) {
                    statusClass = "status-wait";
                    statusText = "Chuẩn bị";
                } else if (item.trangThai === 4) {
                    statusClass = "status-callagain";
                    statusText = "Gọi lại";
                } else {
                    statusClass = "status-empty";
                    statusText = "Chờ tới lượt";
                }

                tr.innerHTML = `
                    <td>${item.soThuTu}</td>
                    <td>${item.tenBN}</td>
                    <td class="${statusClass}">${statusText}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // ===== Ticker qua lượt riêng =====
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
                    pill.innerText = `${item.tenBN} - STT ${item.soThuTu}`;
                    quaLuotContainer.appendChild(pill);
                });
            }
        }

        // ===== Refresh tự động =====
        if (currentInterval) clearTimeout(currentInterval);
        currentInterval = setTimeout(() => loadSTT(idPhongBuong, idChiNhanh), intervalTime);

    } catch (err) {
        console.error("Lỗi load STT:", err);
        if (currentInterval) clearTimeout(currentInterval);
        currentInterval = setTimeout(() => loadSTT(idPhongBuong, idChiNhanh), 5000);
    }
}


// ===== DROPDOWN SEARCH CHUNG =====
function initSearchDropdown({ inputId, dropdownId, hiddenFieldId, data = [], onSelect }) {
    const $input = $("#" + inputId);
    const $dropdown = $("#" + dropdownId);
    const $hidden = $("#" + hiddenFieldId);

    let currentData = data;
    let activeIndex = -1;

    function renderDropdown(keyword, items) {
        $dropdown.empty();
        activeIndex = -1;
        const filtered = items.filter(x => x.ten.toLowerCase().includes(keyword.toLowerCase()) ||
            (x.alias && x.alias.toLowerCase().includes(keyword.toLowerCase())));
        if (!filtered.length) { $dropdown.hide(); return; }
        filtered.forEach(x => {
            const $item = $(`<div class="dropdown-item">${x.ten}</div>`);
            $item.on("click", () => selectItem(x));
            $dropdown.append($item);
        });
        $dropdown.show();
    }

    function selectItem(item) {
        $input.val(item.ten);
        $hidden.val(item.id);
        $dropdown.hide();
        if (onSelect) onSelect(item);
    }

    $input.on("input focus", () => renderDropdown($input.val(), currentData));

    $input.on("keydown", e => {
        const $items = $dropdown.children(".dropdown-item");
        if (!$items.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % $items.length;
            $items.removeClass("active").eq(activeIndex).addClass("active");
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + $items.length) % $items.length;
            $items.removeClass("active").eq(activeIndex).addClass("active");
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0) {
                const chosen = currentData.find(x => x.ten === $items.eq(activeIndex).text());
                if (chosen) selectItem(chosen);
            }
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
    

    // === LOAD KHOA & PHÒNG ===
    $.getJSON("/dist/data/json/DM_Khoa.json", dataKhoa => {
        const listKhoa = dataKhoa.map(n => ({
            ...n,
            alias: n.viettat?.trim() !== "" ? n.viettat.toUpperCase() :
                n.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
        }));

        $.getJSON("/dist/data/json/DM_PhongBuong.json", dataPhong => {
            const listPhong = dataPhong.map(n => ({
                ...n,
                alias: n.viettat?.trim() !== "" ? n.viettat.toUpperCase() :
                    n.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
            })).filter(n => n.idcn === window._idcn); 

            const phongDropdown = initSearchDropdown({
                inputId: "searchPhong",
                dropdownId: "dropdownPhong",
                hiddenFieldId: "selectedPhongId",
                data: [],
                onSelect: ({ id }) => {
                    const phong = listPhong.find(p => p.id === parseInt(id, 10));
                    if (phong) {
                        const khoa = listKhoa.find(k => k.id === phong.idKhoa);
                        if (khoa) { $("#searchKhoa").val(khoa.ten); $("#selectedKhoaId").val(khoa.id); }
                    }
                }
            });

            const khoaDropdown = initSearchDropdown({
                inputId: "searchKhoa",
                dropdownId: "dropdownKhoa",
                hiddenFieldId: "selectedKhoaId",
                data: listKhoa,
                onSelect: ({ id }) => {
                    const khoaId = parseInt(id, 10);
                    const currentPhongId = parseInt($("#selectedPhongId").val(), 10);
                    const currentPhong = listPhong.find(p => p.id === currentPhongId);

                    if (!currentPhong || currentPhong.idKhoa !== khoaId) {
                        $("#searchPhong").val(""); $("#selectedPhongId").val("");
                    }

                    const filteredPhong = listPhong.filter(p => p.idKhoa === khoaId);
                    phongDropdown.setData(filteredPhong);
                    $("#dropdownPhong").empty();
                    phongDropdown.renderDropdown("", filteredPhong);
                    setTimeout(() => $("#searchPhong").focus(), 100);
                }
            });

            // === NÚT LƯU ===
            $("#saveRoomBtn").on("click", function () {
                const phongId = parseInt($("#selectedPhongId").val(), 10);
                const phong = listPhong.find(p => p.id === phongId);
                if (phong) {
                    $("#roomName").text( phong.ten);
                    if (currentInterval) { clearTimeout(currentInterval); currentInterval = null; }
                    if (phongId && window._idcn) loadSTT(phongId, window._idcn);
                }
                const modal = bootstrap.Modal.getInstance(document.getElementById("settingsModal"));
                modal.hide();
            });

        }).fail(() => console.error("Lỗi khi load DM_PhongBuong.json"));
    }).fail(() => console.error("Lỗi khi load DM_Khoa.json"));

    // === LOAD BAN ĐẦU NẾU CÓ PHÒNG ===
    const idPhongBuongInput = document.getElementById("selectedPhongId");
    if (idPhongBuongInput && idPhongBuongInput.value && window._idcn) {
        const phongId = parseInt(idPhongBuongInput.value, 10);
        if (!isNaN(phongId) && phongId > 0) loadSTT(phongId, window._idcn);
    }
});
