

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

        let mainData = data.filter(item => !(item.SoLanGoi === 1 && item.BatDauXuLy === 1));

        mainData.sort((a, b) => {
            if (a.trangThai === 4 && b.trangThai !== 4) return 1;
            if (a.trangThai !== 4 && b.trangThai === 4) return -1;
            return a.soThuTu - b.soThuTu;
        });

        mainData = mainData.slice(0, 5);

        if (!mainData.length) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-3">Không có số thứ tự</td></tr>`;
        } else {
            mainData.forEach(item => {
                const tr = document.createElement("tr");
                let statusClass = "", statusText = "";

                if (item.trangThai === 4) return;

                if (item.trangThai === 1) {
                    statusClass = "status-invite";
                    statusText = "Đang mời";
                } else if (item.trangThai === 2) {
                    statusClass = "status-wait";
                    statusText = "Chuẩn bị";
                } else if (item.trangThai === 3)  {
                    statusClass = "status-empty";
                    statusText = "Chờ tới lượt";
                }
                //if (item.trangThai === 1) {
                //    statusClass = "status-invite";
                //    statusText = "Đang mời";
                //} else if (item.trangThai === 2) {
                //    statusClass = "status-wait";
                //    statusText = "Chuẩn bị";
                //} else if (item.trangThai === 4) {
                //    statusClass = "status-callagain";
                //    statusText = " ";
                //} else {
                //    statusClass = "status-empty";
                //    statusText = "Chờ tới lượt";
                //}

                tr.innerHTML = `
                    <td>${item.soThuTu}</td>
                    <td>${item.tenBN}</td>
                    <td class="${statusClass}">${statusText}</td>
                `;
                tbody.appendChild(tr);
            });
        }

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

    // ===== hàm highlight keyword =====
    function highlightMatch(text, keyword) {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword})`, "gi");
        return text.replace(regex, "<span class='highlight'>$1</span>");
    }

    function renderDropdown(keyword, items) {
        $dropdown.empty();
        activeIndex = -1;

        const filtered = items.filter(x =>
            x.ten.toLowerCase().includes(keyword.toLowerCase()) ||
            (x.viettat && x.viettat.toLowerCase().includes(keyword.toLowerCase())) ||
            (x.alias && x.alias.toLowerCase().includes(keyword.toLowerCase()))
        );

        if (!filtered.length) { $dropdown.hide(); return; }

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

        // 🔹 Nếu hidden có value thì chọn đúng item đó
        const selectedId = parseInt($hidden.val(), 10);
        if (!isNaN(selectedId)) {
            const idx = filtered.findIndex(x => x.id === selectedId);
            if (idx >= 0) {
                const $items = $dropdown.children(".dropdown-item");
                $items.removeClass("active").eq(idx).addClass("active");
                activeIndex = idx;
                $items[idx].scrollIntoView({ block: "nearest" });
            }
        } else {
            // Nếu chưa có thì mặc định chọn dòng đầu
            const $first = $dropdown.children(".dropdown-item").first();
            $first.addClass("active");
            activeIndex = 0;
            $first[0].scrollIntoView({ block: "nearest" });
        }
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
            $items.removeClass("active").eq(activeIndex).addClass("active")
            [0].scrollIntoView({ block: "nearest" });  // 👈 thêm dòng này
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + $items.length) % $items.length;
            $items.removeClass("active").eq(activeIndex).addClass("active")
            [0].scrollIntoView({ block: "nearest" });  // 👈 thêm dòng này
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0) {
                const $active = $items.eq(activeIndex);
                const id = parseInt($active.data("id"), 10);
                const chosen = currentData.find(x => x.id === id);
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

            const khoaDropdown = initSearchDropdown({
                inputId: "searchKhoa",
                dropdownId: "dropdownKhoa",
                hiddenFieldId: "selectedKhoaId",
                data: listKhoa,
                onSelect: ({ id }) => {
                    const khoaId = parseInt(id, 10);

                    // 🔹 Reset input & hidden của Phòng
                    $("#searchPhong").val("");
                    $("#selectedPhongId").val("");

                    // 🔹 Lọc lại danh sách phòng theo khoa
                    const filteredPhong = listPhong.filter(p => p.idKhoa === khoaId);
                    phongDropdown.setData(filteredPhong);
                    $("#dropdownPhong").empty();
                    phongDropdown.renderDropdown("", filteredPhong);

                    // 🔹 Focus sang input phòng
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

        }).fail(() => console.error("Lỗi khi load DM_PhongBuong.json"));
    }).fail(() => console.error("Lỗi khi load DM_Khoa.json"));

    const idPhongBuongInput = document.getElementById("selectedPhongId");
    if (idPhongBuongInput && idPhongBuongInput.value && window._idcn) {
        const phongId = parseInt(idPhongBuongInput.value, 10);
        if (!isNaN(phongId) && phongId > 0) loadSTT(phongId, window._idcn);
    }
});
