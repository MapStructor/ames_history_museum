var modal_header_text = [];
var modal_content_html = [];

modal_header_text["about"] = "ABOUT";
modal_content_html["about"] = `
	<p>
	The Ames Historic Museum Map shows Ames over time.

	Developed by Nitin Gadia.
	nittygrittymapping.org

	Funding provided by Bob Bourne.

	</p>
`;

modal_header_text["builds-info-layer"] = "Buildings";
modal_content_html["builds-info-layer"] = `
	<p>
		All of the building footprints in Ames.
		<br><br>
		Building dates come from the City of Ames Assessor's Department.
		The ages of a buildings are used to assess the property values of parcels.
		<br><br>
		Notes on Accuracy:
		<br>
		*Buildings before [] are often guessed, because beyond a certain year, the effect it has
		on property values does not change significantly.
		<br>
		*Some parcels have more than one building that were built in different years, and
		the buildings take the earliest year they were built. Future effort would need
		to apply correct build dates using Assessor data and historic records.

		<br><br>
		Citation:
		<br>
		[]
	</p>
`;

modal_header_text["roads-info-layer"] = "Roads";
modal_content_html["roads-info-layer"] = `
	<p>
		Current roads in Ames, roughly when they were built.
		<br>
		1865-2026
		<br><br>
		Finding the exact dates a road was built in Ames is a multilayered process, involving
		taking subdivision dates and using maps and other historic records to confirm their
		times, as well as manually deciding dates.
<br><br>
		"Subdivision Roads":
		<br>
		Dates of a local road is usually between the creation of the subdivision
		it was within, and when the buildings were built.
		As you move the time slider, all of the roads appear at the time the subdivision was created,
		and you see the buildings appearing along the roads.
		The actual time the road would be created is usually before buildings were built
		along it, sometimes years apart. If a subdivision was created in 1990 for example,
		it might not be until 1993 that all the roads are built, and you see all the buildings
		fill along the roads.
		Further work would involve creating another layer
		where roads are manually chosen based on their earliest buildings.
<br><br>
		"Confirmed Roads"
<br>
		The dates that roads were built by can be confirmed using maps and historic records.
		Historic maps are georeferenced, and would be added as a layer, and used to
		confirm roads.
		If there are two maps, for example, from 1900 and 1910, we can confirm that the
		new roads were built by 1910, even though they may have been built in 1901.
		Future work would involve georeferencing old maps, and add to this layer.
		Additional records should be searched for that might give the dates roads were
		created or paved, such as the public works department.

		<br><br>
		Citation:
		<br>
		[]
	</p>
`;

modal_header_text["parcels-info-layer"] = "Parcels";
modal_content_html["parcels-info-layer"] = `
	<p>
		Parcels, or land properties, were created when subdivisions
		were created, usually by developers, and sold individually
		to property owners.
		Sometimes parcels are divided by property owners as well,
		but it is rare, with zoning laws taht have been in place
		from the time the subdivisions were created.
		Parcels before subdivisions were divided between owners,
		mostly in rural areas from the time of the first land patents.
		<br>
		See the "Pre-Subdivisions" layer and
		"Story County Land Patents" for more information.

		<br><br>
		Citation:
		<br>
		[]
	</p>
`;

modal_header_text["pre-subdivisions-info-layer"] = "Pre-Subdivisions";
modal_content_html["pre-subdivisions-info-layer"] = `
	<p>
		This layer shows rural parcel divisions and ownership transfers
		that happened after the first land patents,
		and before subdivisions were created for urban settlements and expansion.
		Here, only the parcels were focused on in the area of what became Ames,
		before 1865. You can see the properties owned by John Blair and Cynthia
		Duff, who were instrumental in the founding of Ames, as their properties
		were sold to create the first subdivision of Ames.

		Mouse over the properties, and you can see who owned the parcels.

		More work needs to be done on subdividing the rural parcels with the
		subdivisions. Ultimately, all of the divisions can be done and pieced
		together like was done here. It may be a good idea to first focus on
		the owners that sold their land to those who created subdivisions.

		This required finding records from the Story County Recorder, which
		had Deed Grantor and Grantee Indexes that described the properties
		according to the PLSS System.

		See "Story County Land Patents" and "Subdivisions" layers to see
		what came before and after.
	</p>
`;

modal_header_text["story-patents-info-layer"] = "Story County Land Patents";
modal_content_html["story-patents-info-layer"] = `
	<p>
		Most of the United States was divided into a grid, called the "Public Land
		Survey System", where parcels were sold as original "Land Patents".
		Story County was almost entirely bought up and settled between 1850-1865.
		At the end of the period, the first subdivision was created in Ames,
		and the town was founded.
		<br>
		See the "Pre-Subdivisions" layer and
		"Story County Land Patents" for more information.

		<br><br>
		Citation:
		<br>
		[]
	</p>

	</p>
`;

modal_header_text["subdivisions-info-layer"] = "Subdivisions";
modal_content_html["subdivisions-info-layer"] = `
	<p>
		Subdivisions are the basis of modern land development. 
		Land is purchased from landowners, and subdivided into
		properties that are either built or sold as empty
		lots. Parcels are created at the time a subdivision is approved
		by the City or County government.
<br><br>
		The first subdivision in Ames was created in 1864, and
		the town was incorporated shortly after.
		<br>
		See the "Pre-Subdivisions" layer and "Story County Land Patents"
		for what came before and after.

		<br><br>
		Citation:
		<br>
		[]


	</p>
`;

modal_header_text["rail-roads-info-layer"] = "Railroads";
modal_content_html["rail-roads-info-layer"] = `
	<p>
		Ames was founded as a railroad town, when the Cedar Rapids and Missouri River Railroad contructed a stop in 1864,
		going from Cedar Rapids to Council Bluffs on the Iowa-Nebraska border.
		An additional line was built by 1882 by the Chicago & North Western Railroad, going north from Ames to Albert Lea, on the
		border with Minnesota.

		
		<br><br>
		Citation:
		<br>
		[]


	</p>
`;

modal_header_text["city-limits-info-layer"] = "City limits";
modal_content_html["city-limits-info-layer"] = `
	<p>
		The city limits of Ames, from 1960 onward. Going earlier will require further research.

		
		<br><br>
		Citation:
		<br>
		[]

	</p>
`;
