import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
const parser = require("parse-address");
import { projectStore } from "@atoms/project";
import { orgStore } from "@atoms/organization";
import { roomStore } from "@atoms/room";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    fontSize: 12,
    padding: 20,
  },
  section: {
    flexGrow: 1,
  },
  titleSectionWrapper: {
    flexDirection: "row",
  },
  titleSection: {
    flexDirection: "column",
    width: "50%",
    fontSize: 14,
    marginBottom: 60,
  },
  room: {
    flexDirection: "column",
    paddingBottom: 16,
    marginBottom: 16,
    borderBottom: "2px solid lightgray",
  },
  roomContainer: {
    marginBottom: 50,
  },
  row: {
    flexDirection: "row",
  },
  roomHeader: {
    borderBottom: "1px solid gray",
    paddingBottom: 4,
    marginBottom: 4,
    fontSize: 12,
  },
  rowText: {
    width: 200,
    marginVertical: 4,
  },
  titleLabel: {
    fontWeight: "extrabold",
    fontSize: 12,
  },
  titleText: {
    fontSize: 10,
  },
  roomTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  underlined: {
    borderBottom: "1px solid lightgray",
  },
  addressPlaceholder: {
    width: 125,
    marginTop: 20,
  },
  companyOverview: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottom: "2px solid black",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    flexDirection: "row",
  },
  companyOverviewData: {
    width: "50%",
  },
  companyName: {
    fontSize: 16,
    paddingBottom: 4,
  },
  companyAddress: {
    paddingBottom: 4,
  },
  projectDetailsSection: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  projectAddress: {
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
  logo: {
    width: "150px",
  },
  servicegeekLogo: {
    height: "25px",
    width: "25px",
  },
});

const TitleText = ({ children }: React.PropsWithChildren) => (
  <Text style={styles.titleText}>{children}</Text>
);

// Create Document Component
const PDFExport = () => {
  const rooms = roomStore();

  const { project: projectInfo } = projectStore();
  const { organization: orgInfo } = orgStore();

  const address = parser.parseLocation(projectInfo?.location);
  const orgAddress = parser.parseLocation(orgInfo?.address);

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View>
          <Image
            src='/images/brand/servicegeek.svg'
            style={styles.servicegeekLogo}
          />
          <Text>RestoreGeek</Text>
        </View>
        <View style={styles.companyOverview}>
          <View style={styles.companyOverviewData}>
            <Text style={styles.companyName}>
              {!projectInfo?.companyName || projectInfo.companyName === ""
                ? orgInfo?.name
                : projectInfo.companyName}{" "}
            </Text>
            {orgAddress && (
              <View style={styles.companyAddress}>
                <TitleText>
                  {orgAddress.number}
                  {orgAddress.prefix ? ` ${orgAddress.prefix} ` : " "}
                  {orgAddress.street}
                  {orgAddress.type ? ` ${orgAddress.type}` : ""}
                </TitleText>
                <TitleText>
                  {orgAddress.city}, {orgAddress.state} {orgAddress.zip}
                </TitleText>
              </View>
            )}
          </View>
          <Image
            style={styles.logo}
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/org-pictures/${orgInfo?.publicId}/${orgInfo?.logoId}.png`}
          />
        </View>
        <View style={styles.titleSectionWrapper}>
          <View style={styles.titleSection}>
            {projectInfo?.clientName && (
              <View style={styles.projectDetailsSection}>
                <View>
                  <TitleText>Name: </TitleText>
                </View>
                <View>
                  <TitleText>{projectInfo.clientName}</TitleText>
                </View>
              </View>
            )}
            {address && (
              <View style={styles.projectDetailsSection}>
                <View>
                  <TitleText>Project Address: </TitleText>
                </View>
                <View style={styles.projectAddress}>
                  <TitleText>
                    {address.number}
                    {address.prefix ? ` ${address.prefix} ` : " "}
                    {address.street}
                    {address.type ? ` ${address.type}` : ""}
                  </TitleText>
                  <TitleText>
                    {address.city}, {address.state}
                  </TitleText>
                  <TitleText>{address.zip}</TitleText>
                </View>
              </View>
            )}
            {projectInfo?.clientPhoneNumber && (
              <View style={styles.projectDetailsSection}>
                <View>
                  <TitleText>Client Number: </TitleText>
                </View>
                <View>
                  <TitleText>{projectInfo.clientPhoneNumber}</TitleText>
                </View>
              </View>
            )}
          </View>
          {projectInfo?.insuranceClaimId ||
            (projectInfo?.insuranceCompanyName && (
              <View style={styles.titleSection}>
                {projectInfo.insuranceClaimId && (
                  <View>
                    <TitleText>Claim ID:</TitleText>
                    <TitleText>{projectInfo.insuranceClaimId}</TitleText>
                  </View>
                )}
                {projectInfo.insuranceClaimId && (
                  <View>
                    <TitleText>Carrier:</TitleText>
                    <TitleText>{projectInfo.insuranceCompanyName}</TitleText>
                  </View>
                )}
              </View>
            ))}
        </View>
        <View style={styles.section}>
          {rooms.rooms.map((room) => {
            if (room.detections.length === 0) return null;
            return (
              <View style={styles.roomContainer} key={room.publicId}>
                <View style={styles.room} key={room.publicId}>
                  {room.detections.length > 0 && (
                    <View style={styles.roomHeader}>
                      <Text style={styles.roomTitle}>{room.name}</Text>
                      <View style={styles.row}>
                        <View style={styles.rowText}>
                          <Text>Category</Text>
                        </View>
                        <View style={styles.rowText}>
                          <Text>Code</Text>
                        </View>
                        <View style={styles.rowText}>
                          <Text>Dimensions</Text>
                        </View>
                        <View style={styles.rowText}>
                          <Text>Price</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  {room.detections.map((detection) => (
                    <View style={styles.row} key={detection.publicId}>
                      <View style={styles.rowText}>
                        <Text>{detection.category}</Text>
                      </View>
                      <View style={styles.rowText}>
                        <Text>{detection.code}</Text>
                      </View>
                      <View style={styles.rowText}>
                        {detection.dimension && (
                          <Text style={styles.rowText}>
                            {detection.dimension}{" "}
                            {detection.unit && <>{detection.unit}</>}
                          </Text>
                        )}
                      </View>
                      <View
                        style={{ ...styles.rowText, ...styles.underlined }}
                      />
                    </View>
                  ))}
                </View>
                {room.detections.length > 0 && (
                  <View style={styles.totalSection}>
                    <View
                      style={{
                        ...styles.rowText,
                        ...styles.underlined,
                        paddingBottom: 4,
                      }}
                    >
                      <Text>Total: </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};

export default PDFExport;
